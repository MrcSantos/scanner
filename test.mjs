#!/usr/bin/env zx

const os = require('os');

async function checkRoot() {
  if(await os.userInfo().uid !== 0)
    throw new Error("The user does not have root privileges")
}

async function checkMasscan() {
  try {
    await $`which masscan`
  } catch (error) {
    throw new Error("Masscan is not installed");
  }
}

async function checkNmap() {
  try {
    await $`which nmap`;
  } catch (error) {
    throw new Error("Nmap is not installed");
  }
}

async function checkNikto() {
  const expectedVersion = '2.5.0';
  
  try {
    await $`which nikto`;
  } catch (error) {
    throw new Error("Nikto is not installed");
  }
  
  const { stdout } = await $`nikto -Version`
  if (!stdout.includes(expectedVersion)) {
    throw new Error("Nikto installe with wrong version")
  }
}

async function checkNuclei() {
  try {
    await $`which nuclei`
  } catch (error) {
    throw new Error("Nuclei is not installed");
  }
}

async function checkRequirements() {
  console.log("Checking requirements...");
  var p1 = checkRoot();
  var p2 = checkMasscan();
  var p3 = checkNmap();
  var p4 = checkNikto();
  var p5 = checkNuclei();

  await Promise.all([p1, p2, p3, p4, p5]).then(() => { return 0 })
}

async function scheduleSelfAndExit() {
  const atTime = await question('Enter the time in AT format (e.g., 2:30 PM today): ');
  console.log(`Scheduled the script to run at ${atTime}.`);
  // TODO: Estrarre il nome stesso dello script, non tenerlo hardcodato
  await $`echo "zx test.mjs" | at ${atTime} 2>/dev/null`
  process.exit(0);
}


async function writeToLog(message) {
  const logFile = `./log.txt`;
  write(logFile, `${new Date().toISOString()} - ${message}\n`, { append: true });
};

async function masscan(targetsFile, outputFolder) {
  const masscanXmlFile = `${outputFolder}/masscan`;

  await writeToLog(`${outputFolder} - Masscan - Start`);
  await exec(`masscan -iL ${targetsFile} -p 0-65535 -oA ${masscanXmlFile}`);
  await writeToLog(`${outputFolder} - Masscan - Stop`);
}

async function makeScans() {
  const [targetsFile, outputFolder = './'] = $ARGS;
  const masscanXmlFile = `${outputFolder}/masscan.xml`;
  const nmapXmlFile = `${outputFolder}/nmap.xml`;
  const nucleiXmlFile = `${outputFolder}/nuclei.xml`;
  const niktoXmlFile = `${outputFolder}/nikto.xml`;

  const targets = await cat(targetsFile).toString().split('\n').filter(Boolean);
  
  /*
  Utilizzare jfscan

  OPPURE
  
  La prima cosa da fare e' ottenere tutti i targets
  Dei target i possibili input sono:
  - CIDR
  - IP
  - Domain
  Da qui: capire quali sono i Domain e risolverli a tutti gli ip
  (salvare ovviamente la correlazione)
  
  Aggiungere quegli ip alla lista dei targets
  Rimuovere i duplicati nella lista dei targets
  Fare una lista di soli IP e CIDR
  Fare lo scan con masscan degli ip e cidr
  Una volta concluso controllare la correlazione degli ip con ogni dominio
  prendere la somma delle porte di tutti gli ip corrispondenti senza duplicati e fare una lista
  lanciare nmap, nikto e nuclei contro l'xml di masscan e contro la lista appena creata
  */
  return 0;
}

async function main() {
  await checkRequirements();
  console.log("\nAll requirements satisfied!\n");

  if (argv.schedule)
    await scheduleSelfAndExit();

  await makeScans();

  return 0;
}

main()
