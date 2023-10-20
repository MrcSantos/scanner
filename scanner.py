import subprocess
import datetime

def write_to_log(log_file, message):
    with open(log_file, 'a') as log:
        log.write(f'{datetime.datetime.now().isoformat()} - {message}\n')

def run_masscan(targets_file, output_folder):
    log_file = f'{output_folder}/log.txt'
    masscan_xml_file = f'{output_folder}/masscan.xml'
    
    write_to_log(log_file, 'Starting masscan scan')
    subprocess.run([
        'masscan',
        '-iL', targets_file,
        '-oX', masscan_xml_file,
        '--output-format', 'normal'
    ], check=True)
    subprocess.run([
        'masscan',
        '-iL', masscan_xml_file,
        '-oG', f'{output_folder}/masscan.grep'
    ], check=True)
    write_to_log(log_file, 'Masscan scan completed')

def run_nmap(masscan_xml_file, output_folder, nmap_flags):
    log_file = f'{output_folder}/log.txt'
    
    write_to_log(log_file, 'Starting nmap scan')
    subprocess.run([
        'nmap',
        '-iL', masscan_xml_file,
        '-oX', f'{output_folder}/nmap.xml',
        '--output-format', 'normal',
        *nmap_flags
    ], check=True)
    subprocess.run([
        'nmap',
        '-iL', masscan_xml_file,
        '-oG', f'{output_folder}/nmap.grep',
        *nmap_flags
    ], check=True)
    write_to_log(log_file, 'Nmap scan completed')

def run_nikto(targets_file, output_folder):
    log_file = f'{output_folder}/log.txt'
    
    write_to_log(log_file, 'Starting nikto scan')
    subprocess.run(['mkdir', '-p', f'{output_folder}/nikto'], check=True)
    
    with open(targets_file, 'r') as f:
        targets = f.read().splitlines()
    
    for target in targets:
        subprocess.run([
            'nikto',
            '-h', target,
            '-Format', 'json',
            '-output', f'{output_folder}/nikto/nikto-{target}.json'
        ], check=True)
    
    write_to_log(log_file, 'Nikto scan completed')

def run_nuclei(targets_file, output_folder):
    log_file = f'{output_folder}/log.txt'
    
    write_to_log(log_file, 'Starting nuclei scan')
    subprocess.run(['mkdir', '-p', f'{output_folder}/nuclei'], check=True)
    
    with open(targets_file, 'r') as f:
        targets = f.read().splitlines()
    
    for target in targets:
        subprocess.run([
            'nuclei',
            '-target', target,
            '-o', f'{output_folder}/nuclei/nuclei-{target}.json',
            '-json'
        ], check=True)
    
    write_to_log(log_file, 'Nuclei scan completed')

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python script.py targets_file [output_folder] [nmap_flags]")
        sys.exit(1)

    targets_file = sys.argv[1]
    output_folder = sys.argv[2] if len(sys.argv) > 2 else '.'
    nmap_flags = sys.argv[3:] if len(sys.argv) > 3 else []

    run_masscan(targets_file, output_folder)
    run_nmap(f'{output_folder}/masscan.xml', output_folder, nmap_flags)
    run_nikto(targets_file, output_folder)
    run_nuclei(targets_file, output_folder)
