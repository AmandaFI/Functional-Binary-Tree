// jest for typescript --> https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/#jest-config-file
// globals --> https://jestjs.io/docs/api
// expect options --> https://jestjs.io/docs/expect

// install:
// npm install --save-dev jest typescript ts-jest @types/jest
// npx ts-jest config:init

// run tests -> npx jest

import { binaryTree } from "./binaryTree";

test("test search method", () => {
	const tree = binaryTree(10);
	tree.addNode(11);

	expect(tree.search(11)).toBe(true);
});

test("test search method", () => {
	const tree = binaryTree(10);
	tree.addNode(11);

	expect(tree.search(11)).toBe(false);
});

// describe('my beverage', () => {
//   test('is delicious', () => {
//     expect(myBeverage.delicious).toBeTruthy();
//   });

//   test('is not sour', () => {
//     expect(myBeverage.sour).toBeFalsy();
//   });
// });
