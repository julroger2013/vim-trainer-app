# Vim Navigation Trainer

An interactive web application for practicing Vim navigation commands with keyboard shortcut support for modern browsers.

## Features

- **Progressive Learning**: Beginner, intermediate, and advanced difficulty levels
- **Real-time Feedback**: Visual indicators for cursor position and target location
- **Browser Compatibility**: Multiple keyboard shortcuts for Chromium-based browsers on macOS
- **Responsive Design**: Works on desktop and mobile devices

## Keyboard Shortcuts

- **Cmd+N, Cmd+G, or F5**: Generate new exercise
- **Cmd+Enter**: Check current position
- **Standard Vim Keys**: h, j, k, l, w, b, 0, $, gg, G

## Development Workflow

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/julroger2013/vim-trainer-app.git
   cd vim-trainer-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: Visit http://localhost:3000

### Making Changes

1. **Edit files locally** (most changes will be in `src/VimTrainer.jsx`)
2. **Test locally** at http://localhost:3000
3. **Commit and push changes**:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```

### Deploy to Server

**Option 1: Automatic deployment script**
```bash
./deploy.sh
```

**Option 2: Manual deployment**
```bash
# SSH to server and pull latest changes
ssh root@192.168.50.10
pct exec 110 -- bash -c 'cd /opt/vim-trainer && git pull origin main'
pct exec 110 -- bash -c 'cd /opt/vim-trainer && docker compose up -d --build'
```

The app will be available at: http://192.168.50.254:3000

## Project Structure

```
vim-trainer-app/
├── src/
│   ├── VimTrainer.jsx      # Main React component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Container definition
├── nginx.conf              # Web server configuration
├── deploy.sh               # Automated deployment script
└── README.md               # This file
```

## Technical Details

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Containerization**: Docker with nginx
- **Deployment**: Git-based workflow

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

## Local Development Setup
```bash
npm install
npm run dev
```

## Building for Production
```bash
npm run build
npm run preview
```

## Troubleshooting

### Container won't start
- Check Docker logs: `docker compose logs vim-trainer`
- Verify port availability: `netstat -tulpn | grep 3000`

### Application not accessible
- Check firewall settings on Proxmox
- Verify the container is running: `docker ps`
- Test locally: `curl http://localhost:3000`

### Performance issues
- Increase container memory allocation
- Check Proxmox host resources