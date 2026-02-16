
import sys

def cleanup():
    path = 'c:/Users/karan/Doccument-sum/src/App.jsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # We want to remove the block between the new 3D integration and the end of that section.
    # New block ends at line 518 (Secondary Atmosphere closing div)
    # Feature Section starts around 598.
    
    # Looking for markers
    start_marker = '{/* Secondary Atmosphere */}'
    end_marker = '{/* Features Section */}'
    
    new_lines = []
    skip = False
    
    for i, line in enumerate(lines):
        if start_marker in line:
            new_lines.append(line)
            # Find the closing div of atmosphere (it's 2 lines after start_marker in my current state)
            new_lines.append(lines[i+1])
            new_lines.append(lines[i+2])
            skip = True
            continue
        
        if end_marker in line:
            skip = False
        
        if not skip:
            new_lines.append(line)
            
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == '__main__':
    cleanup()
