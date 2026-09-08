# Lab-Computer-Network-Scanner
Lab Network Port Scanner is a computer laboratory monitoring system that discovers connected PCs, checks online/offline status, scans service ports, monitors network services, and maintains scan history across departments and labs through a centralized real-time dashboard.
#  Lab Network Port Scanner

### “Which Computers Are Actually Working?”

A professional **Computer Laboratory Device & Service Availability Monitoring System** designed for college laboratories.

The system helps administrators discover connected computers, check their availability, scan predefined network ports, monitor services, and view all results through a centralized dashboard.

---

##  Institution

**Meenakshi Sundararajan Engineering College**

The system is designed to monitor computer laboratories across different departments.

### Departments Supported

- CSE – Computer Science and Engineering
- IT – Information Technology
- ECE – Electronics and Communication Engineering
- EEE – Electrical and Electronics Engineering
- Civil Engineering
- Mechanical Engineering
- ADS – Artificial Intelligence and Data Science

###  Lab Structure

Each department can have:

- Lab 1
- Lab 2
- Lab 3
- Lab 4
- Lab 5
- Lab 6
- CC1
- CC2
- CC3

Administrators can select a **Department → Lab → Connected PCs** and monitor the systems available inside that laboratory.

---

##  Problem Statement

College lab administrators often need to manually check multiple computers to determine:

- Which computers are currently working
- Which computers are offline
- Which systems are reachable
- Which network services are available
- Which required ports are open

This manual process can be time-consuming and difficult to manage across multiple laboratories.

---

##  Proposed Solution

The **Lab Network Port Scanner** provides a centralized monitoring system that:

- Automatically discovers computers in an authorized lab network
- Identifies IP addresses
- Checks device availability
- Scans predefined network ports
- Detects available services
- Displays real-time monitoring information
- Maintains scan history
- Compares previous and current scans
- Supports manual and scheduled scanning

---

##  Key Features

###  Admin Login

Secure login interface for laboratory administrators.

###  Department & Lab Selection

Select the required:

**Department → Laboratory → PCs**

and monitor computers belonging to that lab.

###  Dashboard

Displays:

- Total Devices
- Online Devices
- Offline Devices
- Active Services
- Open Ports
- Last Scan

###  Network Scan

Supports:

- Quick Scan
- Standard Scan
- Service Scan
- Predefined Ports
- Custom Ports
- TCP/UDP Selection

###  Device Monitoring

Displays:

- Device Name
- IP Address
- Online/Offline Status
- Open Ports
- Services
- Last Seen
- Response Time

###  Port & Service Monitoring

Monitors services such as:

- HTTP – 80
- HTTPS – 443
- SSH – 22
- FTP – 21
- Telnet – 23
- DNS – 53
- RDP – 3389

###  Network Overview

Provides a visual topology:

```text
Monitoring Server
       │
       ▼
   Lab Network
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
PC-01 PC-02 PC-03
