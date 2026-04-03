import assert from "node:assert/strict";
import { products } from "../data.js";

assert.equal(products.length, 6, "Expected 6 products in the dataset");

for (const product of products) {
  assert.ok(product.code, "Each product must have a code");
  assert.ok(product.image_small_url.startsWith("https://"), "Image URL must be https");
  assert.ok(Object.keys(product.nutriments).length > 0, "Nutriments cannot be empty");
}

console.log("Smoke test passed: dataset is loaded and structurally valid.");

