APP_DIR="/home/chris/SaaS"

mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.next" ]; then
  find "$APP_DIR/.next" -mindepth 1 -maxdepth 1 ! -name 'cache' -exec rm -rf {} +
  if [ -d "$APP_DIR/.next/cache" ]; then
    find "$APP_DIR/.next/cache" -mindepth 1 -maxdepth 1 ! -name 'images' -exec rm -rf {} +
  fi
fi
