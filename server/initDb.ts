import { storage } from "./storage";

async function initializeTestData() {
  console.log("Initializing test data in the database...");
  
  try {
    await (storage as any).initializeTestData();
    console.log("Test data initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing test data:", error);
  }
}

// Run the initialization
initializeTestData();