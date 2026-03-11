const crypto = require('crypto');

// Test different secret keys and formats
const secretKeys = [
  "8gBm/:&EnhH.1/q(",
  "8gBm/:&EnhH.1/q(",  // Make sure no extra spaces
];

// Test data
const testData = {
  amt: "1000",
  txAmt: "1000", 
  pid: "1_1_1708610400000",
  scd: "EPAYTEST",
};

console.log("Testing eSewa Signature Generation\n");
console.log("Test Data:", testData);
console.log("\n" + "=".repeat(80) + "\n");

secretKeys.forEach((secretKey, index) => {
  console.log(`\nTest ${index + 1} - Secret Key: "${secretKey}"`);
  console.log("Secret Key Length:", secretKey.length);
  console.log("Secret Key Bytes:", Buffer.from(secretKey).toString('hex'));
  
  // Test with different field orders
  const signableData = `${testData.txAmt},${testData.pid},${testData.scd}`;
  
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signableData)
    .digest("base64");
  
  console.log("Signable Data:", signableData);
  console.log("Generated Signature:", signature);
  console.log("-".repeat(80));
});

// Also test what eSewa might be expecting
console.log("\n\n❗ IF ES104 PERSISTS - Try these alternative field orders:\n");

const allOrders = [
  { name: "txAmt,pid,scd", data: `${testData.txAmt},${testData.pid},${testData.scd}` },
  { name: "txAmt,scd,pid", data: `${testData.txAmt},${testData.scd},${testData.pid}` },
  { name: "amt,pid,scd", data: `${testData.amt},${testData.pid},${testData.scd}` },
];

allOrders.forEach(order => {
  const sig = crypto
    .createHmac("sha256", "8gBm/:&EnhH.1/q(")
    .update(order.data)
    .digest("base64");
  console.log(`${order.name}: ${sig}`);
});
