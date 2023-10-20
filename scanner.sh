#!/bin/bash

# Check for required arguments
if [ $# -lt 1 ]; then
  echo "Usage: $0 targets_file [output_folder] [nmap_flags]"
  exit 1
fi

targets_file=$1
output_folder=${2:-.}
nmap_flags="${@:3}"

log_file="$output_folder/log.txt"
masscan_xml="$output_folder/masscan.xml"

function write_to_log {
  echo "$(date -Iseconds) - $1" >> "$log_file"
}

function run_masscan {
  write_to_log "Starting masscan scan"
  masscan -iL "$targets_file" -oX "$masscan_xml" --output-format normal
  masscan -iL "$masscan_xml" -oG "$output_folder/masscan.grep"
  write_to_log "Masscan scan completed"
}

function run_nmap {
  write_to_log "Starting nmap scan"
  nmap -iL "$masscan_xml" -oX "$output_folder/nmap.xml" --output-format normal $nmap_flags
  nmap -iL "$masscan_xml" -oG "$output_folder/nmap.grep" $nmap_flags
  write_to_log "Nmap scan completed"
}

function run_nikto {
  write_to_log "Starting nikto scan"
  mkdir -p "$output_folder/nikto"
  while IFS= read -r target; do
    nikto -h "$target" -Format json -output "$output_folder/nikto/nikto-$(basename "$target").json"
  done < "$targets_file"
  write_to_log "Nikto scan completed"
}

function run_nuclei {
  write_to_log "Starting nuclei scan"
  mkdir -p "$output_folder/nuclei"
  while IFS= read -r target; do
    nuclei -target "$target" -o "$output_folder/nuclei/nuclei-$(basename "$target").json" -json
  done < "$targets_file"
  write_to_log "Nuclei scan completed"
}

run_masscan
run_nmap
run_nikto
run_nuclei
