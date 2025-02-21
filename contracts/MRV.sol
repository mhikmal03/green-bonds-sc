// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MRV is Ownable {
    struct Project {
        string projectType; // Jenis proyek: "carbon", "water", dll.
        uint256 reportedValue; // Data dari IoT (contoh: 100 ton CO₂, 50m3 air)
        uint256 verifiedValue; // Data dari Auditor
        bool isVerified;
    }

    mapping(address => Project) public projects;
    mapping(address => bool) public auditors;

    event ProjectRegistered(address indexed project, string projectType);
    event IoTDataSubmitted(address indexed project, uint256 reportedValue);
    event VerificationSubmitted(address indexed auditor, address indexed project, uint256 verifiedValue);
    event DataValidated(address indexed project, bool isValid);

    /**
     * @notice Konstruktor yang memanggil Ownable dengan `msg.sender`
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Menambahkan auditor yang berhak melakukan verifikasi
     * @dev Hanya bisa dilakukan oleh pemilik kontrak
     */
    function addAuditor(address _auditor) external onlyOwner {
        auditors[_auditor] = true;
    }

    /**
     * @notice Pendaftaran proyek baru dalam MRV
     */
    function registerProject(string memory projectType) external {
        projects[msg.sender] = Project(projectType, 0, 0, false);
        emit ProjectRegistered(msg.sender, projectType);
    }

    /**
     * @notice IoT mengirimkan data proyek (misalnya 100 ton CO₂ reduction)
     */
    function submitIoTData(uint256 reportedValue) external {
        require(bytes(projects[msg.sender].projectType).length > 0, "Proyek belum terdaftar");
        projects[msg.sender].reportedValue = reportedValue;
        emit IoTDataSubmitted(msg.sender, reportedValue);
    }

    /**
     * @notice Auditor melakukan verifikasi data dari IoT
     */
    function submitVerification(address project, uint256 verifiedValue) external {
        require(auditors[msg.sender], "Anda bukan auditor resmi");
        require(bytes(projects[project].projectType).length > 0, "Proyek tidak ditemukan");

        projects[project].verifiedValue = verifiedValue;

        // Jika selisih data IoT & auditor tidak lebih dari 10%, maka valid
        uint256 reported = projects[project].reportedValue;
        if (verifiedValue >= reported * 90 / 100 && verifiedValue <= reported * 110 / 100) {
            projects[project].isVerified = true;
        } else {
            projects[project].isVerified = false;
        }

        emit VerificationSubmitted(msg.sender, project, verifiedValue);
        emit DataValidated(project, projects[project].isVerified);
    }

    /**
     * @notice Mengecek apakah proyek valid sebelum yield didistribusikan
     */
    function isProjectValid(address project) public view returns (bool) {
        return projects[project].isVerified;
    }
}


