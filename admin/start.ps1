$env:SQLITE_DB_PATH = "C:/Users/brax/Desktop/tobi/shared-data/tobillion.db"
Set-Location -LiteralPath "C:\Users\brax\Desktop\tobi\admin"
& "node_modules\.bin\next.cmd" dev -p 3001
