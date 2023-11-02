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
  var p1 = checkRoot();
  var p2 = checkMasscan();
  var p3 = checkNmap();
  var p4 = checkNikto();
  var p5 = checkNuclei();

  Promise.all([p1, p2, p3, p4, p5]).then(() => { return 0 })
}

async function scheduleSelf() {
  const atTime = await question('Enter the time in AT format (e.g., 2:30 PM today): ');
  console.log(`Scheduled the script to run at ${atTime}.`);
  await $`echo "zx test.mjs" | at ${atTime} 2>/dev/null`
  process.exit(0);
}

async function main() {
  await checkRequirements();

  if (argv.schedule)
    await scheduleSelf();



  console.log('This is the execution phase.');
}

main()
