#!/usr/bin/env zx

import { exec, rm, mkdir, cd, write, cat } from 'zx';

async function run() {
  const [targetsFile, outputFolder = './'] = $ARGS;

  const targets = await cat(targetsFile).toString().split('\n').filter(Boolean);
  const logFile = `${outputFolder}/log.txt`;
  const masscanXmlFile = `${outputFolder}/masscan.xml`;

  // Function to write to the log file
  const writeToLog = async (message) => {
    await write(logFile, `${new Date().toISOString()} - ${message}\n`, { append: true });
  };

  // Start masscan scan
  await writeToLog('Starting masscan scan');
  await exec(`masscan -iL ${targetsFile} -oX ${masscanXmlFile} --output-format normal && masscan -iL ${masscanXmlFile} -oG ${outputFolder}/masscan.grep`);
  await writeToLog('Masscan scan completed');

  // Start nmap scan
  await writeToLog('Starting nmap scan');
  await exec(`nmap -iL ${masscanXmlFile} -oX ${outputFolder}/nmap.xml --output-format normal -your-flags-here && nmap -iL ${masscanXmlFile} -oG ${outputFolder}/nmap.grep -your-flags-here`);
  await writeToLog('Nmap scan completed');

  // Start nikto scan
  await writeToLog('Starting nikto scan');
  await mkdir('-p', `${outputFolder}/nikto`);
  await cd(`${outputFolder}/nikto`);
  for (const target of targets) {
    await exec(`nikto -h ${target} -Format json -output nikto-${target}.json`);
  }
  await cd('..');
  await writeToLog('Nikto scan completed');

  // Start nuclei scan
  await writeToLog('Starting nuclei scan');
  await mkdir('-p', `${outputFolder}/nuclei`);
  await cd(`${outputFolder}/nuclei`);
  for (const target of targets) {
    await exec(`nuclei -target ${target} -o nuclei-${target}.json -json`);
  }
  await cd('..');
  await writeToLog('Nuclei scan completed');
}

run();
