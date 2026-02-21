import os
import glob

migration_dir = 'src/main/resources/db/migration'
sql_files = glob.glob(os.path.join(migration_dir, '*.sql'))

for file_path in sql_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    new_content = new_content.replace("INTERVAL '1' day", "INTERVAL '1' DAY")
    new_content = new_content.replace("INTERVAL '2' day", "INTERVAL '2' DAY")
    new_content = new_content.replace("INTERVAL '3' day", "INTERVAL '3' DAY")
    new_content = new_content.replace("INTERVAL '4' day", "INTERVAL '4' DAY")
    new_content = new_content.replace("INTERVAL '5' day", "INTERVAL '5' DAY")
    new_content = new_content.replace("INTERVAL '1' hour", "INTERVAL '1' HOUR")
    new_content = new_content.replace("INTERVAL '20' minutes", "INTERVAL '20' MINUTE")
    new_content = new_content.replace("INTERVAL '30' minutes", "INTERVAL '30' MINUTE")
    new_content = new_content.replace("INTERVAL '45' minutes", "INTERVAL '45' MINUTE")
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated INTERVAL syntax in {file_path}")

print("Done.")
