
const BASE_URL = "https://e-commerce-website-lz7y.onrender.com";

async function testAPI(name, url, expectedStatus = 200) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    const passed = response.status === expectedStatus;

    console.log(
      `${passed ? "✅ PASS" : "❌ FAIL"} | ${name} | Status: ${response.status}`
    );

    console.log("Response:", data);
    console.log("-----------------------------------");
  } catch (error) {
    console.log(`❌ FAIL | ${name} | ${error.message}`);
  }
}

async function runTests() {
  console.log("ShopEase API Tests Started\n");

  await testAPI(
    "Backend health check",
    `${BASE_URL}/`
  );

  await testAPI(
    "Products API",
    `${BASE_URL}/api/products`
  );

  await testAPI(
    "Protected orders API without login",
    `${BASE_URL}/api/orders`,
    401
  );

  console.log("ShopEase API Tests Completed");
}

runTests();

