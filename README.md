#### Step 1: Install Ubuntu (if you're on Windows/macOS)
- **Windows users**: Install [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) and install Ubuntu 22.04 LTS from the Microsoft Store
- **macOS users**: Open Terminal – no need for Ubuntu

#### Step 2: Install Docker and Docker Compose

#### 🐳 Install Docker
On Ubuntu:
```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

Then restart your terminal or run:
newgrp docker

Verify Docker installation
docker --version

Install docker compose:
sudo apt install -y docker-compose

Verify docker compose installation
docker-compose --version
```

#### 🚀 Running the App
```
Clone Repo:
git clone https://github.com/your-username/YMFSensorApp.git
cd YMFSensorApp

Build and start containers in root folder:
docker-compose up --build
```
#### 🌐 Accessing the App
```
Component	URL
Frontend	http://localhost:3000
Backend	  http://localhost:4000
```

#### 🧪 Making Changes
```
Modify the frontend code in: YorkuSensorFrontend/
Modify the backend code in: BackendYorkuSensor/

After making changes:
docker-compose up --build

To fully reset containers and data:
docker-compose down -v
```


