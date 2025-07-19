# Vim Navigation Trainer

A React-based interactive trainer for learning Vim navigation commands. This application helps users practice essential Vim movements in a gamified environment.

## Features

- Interactive text editor simulation
- Progressive difficulty levels (Beginner, Intermediate, Advanced)
- Real-time feedback and scoring
- Comprehensive command coverage (h,j,k,l, w,b, 0,$, gg,G)
- Visual cursor and target indicators

## Requirements

- Docker and Docker Compose
- Proxmox server with container support

## Deployment on Proxmox

### Method 1: Using Docker Compose (Recommended)

1. **Transfer files to your Proxmox server:**
   ```bash
   # Copy the entire project directory to your Proxmox server
   scp -r vim-trainer-app/ user@your-proxmox-server:/path/to/deployment/
   ```

2. **SSH into your Proxmox server:**
   ```bash
   ssh user@your-proxmox-server
   cd /path/to/deployment/vim-trainer-app
   ```

3. **Build and run the application:**
   ```bash
   # Build and start the container
   docker-compose up -d --build
   
   # Check if it's running
   docker-compose ps
   ```

4. **Access the application:**
   - Open your browser and go to `http://your-proxmox-server-ip:3000`

### Method 2: Manual Docker Build

1. **Build the Docker image:**
   ```bash
   docker build -t vim-trainer .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name vim-trainer-app \
     --restart unless-stopped \
     -p 3000:80 \
     vim-trainer
   ```

### Method 3: Development Mode (for testing)

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   ```

## Proxmox Container Template (LXC)

If you prefer to use LXC containers instead of Docker:

1. **Create a new LXC container:**
   - Use Ubuntu 22.04 template
   - Allocate at least 1GB RAM and 10GB storage
   - Enable nesting if using Docker inside LXC

2. **Install Docker in the LXC container:**
   ```bash
   apt update && apt install -y docker.io docker-compose
   systemctl enable --now docker
   ```

3. **Follow the deployment steps above**

## Configuration

### Port Configuration
- Default port: 3000
- To change the port, modify the `docker-compose.yml` file:
  ```yaml
  ports:
    - "YOUR_PORT:80"
  ```

### Reverse Proxy Setup (Optional)
For production deployment, consider setting up a reverse proxy with nginx or traefik:

```nginx
server {
    listen 80;
    server_name vim-trainer.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Container won't start
- Check Docker logs: `docker-compose logs vim-trainer`
- Verify port availability: `netstat -tulpn | grep 3000`

### Application not accessible
- Check firewall settings on Proxmox
- Verify the container is running: `docker ps`
- Test locally: `curl http://localhost:3000`

### Performance issues
- Increase container memory allocation
- Check Proxmox host resources

## Commands Reference

### Basic Navigation (Beginner)
- `h` - Move left
- `j` - Move down  
- `k` - Move up
- `l` - Move right

### Line Navigation (Intermediate)
- `0` - Beginning of line
- `$` - End of line
- `w` - Next word
- `b` - Previous word

### File Navigation (Advanced)
- `gg` - Go to first line
- `G` - Go to last line

## Development

### Local Development Setup
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

### Testing the Docker Build
```bash
docker build -t vim-trainer-test .
docker run -p 3000:80 vim-trainer-test
```

## Support

For issues or questions:
1. Check the container logs
2. Verify all files are properly copied
3. Ensure Docker and Docker Compose are properly installed
4. Check Proxmox firewall and networking settings
