# 🚀 Deployment Guide - Crypto DCA Dashboard

## GitHub Pages Deployment (Recommended)

### Prerequisites
- GitHub repository named `dca-bot-dashboard_r2_claude`
- Repository must be public (for free GitHub Pages)

### Automatic Deployment Setup

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Crypto DCA Dashboard"
   git branch -M main
   git remote add origin https://github.com/yourusername/dca-bot-dashboard_r2_claude.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - The workflow will automatically trigger on push to main

3. **Access your dashboard**:
   - URL: `https://yourusername.github.io/dca-bot-dashboard_r2_claude/`
   - First deployment takes ~2-3 minutes

### Manual Configuration (if needed)

If automatic deployment doesn't work:

1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select "gh-pages" branch (created by the workflow)
4. Save settings

## 🔧 Workflow Details

The GitHub Actions workflow (`/.github/workflows/deploy.yml`) automatically:

- ✅ Installs Node.js dependencies
- ✅ Runs ESLint (continues on errors)
- ✅ Builds the production bundle
- ✅ Copies sample data files
- ✅ Deploys to GitHub Pages

### Environment Variables Set:
- `VITE_DATA_BASE_PATH: '/dca-bot-dashboard_r2_claude/data'`
- `NODE_ENV: 'production'`
- `base: '/dca-bot-dashboard_r2_claude/'` (Vite config)

## 📊 Data File Management

### For Demo/Development:
Sample data files are automatically copied from `public/data/` to `dist/data/` during build.

### For Production Use:
Replace the sample data files with real bot output:

1. **Update data files** in your repository:
   ```bash
   # Copy your bot's data files
   cp /path/to/bot/positions_current.json public/data/
   cp /path/to/bot/snapshots.ndjson public/data/
   cp /path/to/bot/transactions.ndjson public/data/
   ```

2. **Commit and push**:
   ```bash
   git add public/data/
   git commit -m "Update data files"
   git push
   ```

3. **Automatic redeployment** happens within 2-3 minutes

## 🔄 Updating the Dashboard

### Code Changes:
```bash
# Make your changes
git add .
git commit -m "Update dashboard features"
git push
```

### Data Updates:
The bot should update files in the `public/data/` directory, then commit and push changes for automatic redeployment.

## 🛠️ Alternative Deployment Options

### Static File Server
```bash
npm run build
# Serve the dist/ directory with any static file server
# Make sure data files are accessible at /data/ path
```

### NGINX Example
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /data {
        alias /path/to/bot/data;
    }
}
```

### Docker Deployment
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY public/data/ /usr/share/nginx/html/data/
EXPOSE 80
```

## 📈 Monitoring

### Build Status
- Check GitHub Actions tab for build status
- Failed builds will show error details
- Successful builds deploy within 2-3 minutes

### Data Freshness
- Dashboard shows "Last Updated" timestamp
- Data refreshes automatically every 30 seconds
- Check browser console for fetch errors

## 🔐 Security Notes

- Repository must be public for free GitHub Pages
- Data files are publicly accessible
- No sensitive information should be in data files
- Consider private repository + GitHub Pages Pro for sensitive data

## 🆘 Troubleshooting

### Build Fails
1. Check GitHub Actions logs
2. Verify all dependencies in package.json
3. Test build locally: `npm run build:ci`

### Page Not Loading
1. Verify GitHub Pages is enabled
2. Check repository name matches `dca-bot-dashboard_r2_claude`
3. Wait 2-3 minutes after first deployment

### Data Not Loading
1. Verify files exist in `public/data/`
2. Check browser console for 404 errors
3. Ensure data files have correct JSON/NDJSON format

### Performance Issues
1. Check data file sizes (optimize if >1MB)
2. Monitor browser network tab
3. Consider data downsampling for large histories