// jest for typescript --> https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/#jest-config-file
// globals --> https://jestjs.io/docs/api
// expect options --> https://jestjs.io/docs/expect

// install:
// npm install --save-dev jest typescript ts-jest @types/jest
// npx ts-jest config:init

// run tests -> npx jest

import { binaryTree } from "./binaryTree.ts";

// test("test search method", () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(11);

// 	expect(tree.search(11)).toBe(true);
// });

// test("test search method", () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(11);

// 	expect(tree.search(11)).toBe(false);
// });

// describe('my beverage', () => {
//   test('is delicious', () => {
//     expect(myBeverage.delicious).toBeTruthy();
//   });

//   test('is not sour', () => {
//     expect(myBeverage.sour).toBeFalsy();
//   });
// });

// ------------------------- Deno -------------------------
// https://dev.to/robdwaller/how-to-write-tests-in-deno-pen
// https://deno.land/manual@v1.36.4/basics/testing/assertions

import { assertEquals, assertThrows } from "https://deno.land/std@0.201.0/assert/mod.ts";

Deno.test("Element of type Object without sort function", () => {
	assertThrows(() => binaryTree({ name: "Michael", age: 20 }), Error, "Unable to sort tree.");
});

Deno.test("Element of type Function", () => {
	assertThrows(() => binaryTree({ name: "Michael", age: 20 }), Error, "Unable to sort tree.");
});

Deno.test("Traverse Inorder", () => {
	const tree = binaryTree(5);
	tree.add(2);
	tree.add(1);
	tree.add(3);
	tree.add(7);
	tree.add(6);
	tree.add(8);
	assertEquals(tree.traverse(), [1, 2, 3, 5, 6, 7, 8]);
});

Deno.test("Traverse Preorder", () => {
	const tree = binaryTree(5);
	tree.add(2);
	tree.add(1);
	tree.add(3);
	tree.add(7);
	tree.add(6);
	tree.add(8);
	assertEquals(tree.traverse("Preorder"), [5, 2, 1, 3, 7, 6, 8]);
});

Deno.test("Traverse Postorder", () => {
	const tree = binaryTree(5);
	tree.add(2);
	tree.add(1);
	tree.add(3);
	tree.add(7);
	tree.add(6);
	tree.add(8);
	assertEquals(tree.traverse("Postorder"), [1, 3, 2, 6, 8, 7, 5]);
});

Deno.test("Tree creation", () => {
	const tree = binaryTree(10);
	assertEquals(tree.traverse(), [10]);
});

Deno.test("Add node less than root", () => {
	const tree = binaryTree(10);
	tree.add(5);
	assertEquals(tree.traverse(), [5, 10]);
});

Deno.test("Add node greater than root", () => {
	const tree = binaryTree(10);
	tree.add(15);
	assertEquals(tree.traverse(), [10, 15]);
});

Deno.test("Add node equal to root", () => {
	const tree = binaryTree(10);
	tree.add(10);
	assertEquals(tree.traverse(), [10]);
});
