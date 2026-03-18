async function test() {
  try {
    const { PDFParse } = await import("pdf-parse");
    const instance = new PDFParse();
    console.log("Instance methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
    
    // Most likely it has a parse method
    console.log("Instance keys:", Object.keys(instance));
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();


