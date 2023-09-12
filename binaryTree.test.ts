// jest for typescript --> https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/#jest-config-file
// globals --> https://jestjs.io/docs/api
// expect options --> https://jestjs.io/docs/expect

// install:
// npm install --save-dev jest typescript ts-jest @types/jest
// npx ts-jest config:init

// run tests -> npx jest

import { binaryTree } from "./binaryTree";

describe("Create tree.", () => {
	test("Do not allow object type elements without comparison function.", () => {
		expect(() => {
			binaryTree({ name: "Michael", age: 45 });
		}).toThrow();
	});

	test("Do not allow functions element.", () => {
		expect(() => {
			binaryTree(() => 1);
		}).toThrow();
	});
});

describe("Add element.", () => {
	let tree: ReturnType<typeof binaryTree<number>>;
	beforeEach(() => (tree = binaryTree(10)));

	test("Add left child to root.", () => {
		tree.add(5);
		expect(tree.traverse()).toEqual([5, 10]);
	});

	test("Add left child to left root subtree.", () => {
		tree.add(5);
		tree.add(1);
		expect(tree.traverse()).toEqual([1, 5, 10]);
	});

	test("Add right child to left root subtree.", () => {
		tree.add(5);
		tree.add(7);
		expect(tree.traverse()).toEqual([5, 7, 10]);
	});

	test("Add right child to root.", () => {
		tree.add(15);
		expect(tree.traverse()).toEqual([10, 15]);
	});

	test("Add left child to right root subtree.", () => {
		tree.add(15);
		tree.add(11);
		expect(tree.traverse()).toEqual([10, 11, 15]);
	});

	test("Add right child to right root subtree.", () => {
		tree.add(15);
		tree.add(17);
		expect(tree.traverse()).toEqual([10, 15, 17]);
	});
});

//      6
//     /  \
//    2    9
//  /\     /\
// 1  4   8  13
//    /       \
//   3         18

describe("Traverse tree.", () => {
	let tree: ReturnType<typeof binaryTree<number>>;
	beforeEach(() => {
		tree = binaryTree(6);
		tree.add(2);
		tree.add(9);
		tree.add(1);
		tree.add(4);
		tree.add(8);
		tree.add(13);
		tree.add(3);
		tree.add(18);
	});

	test("Inorder", () => {
		expect(tree.traverse("Inorder")).toEqual([1, 2, 3, 4, 6, 8, 9, 13, 18]);
	});

	test("Preorder", () => {
		expect(tree.traverse("Preorder")).toEqual([6, 2, 1, 4, 3, 9, 8, 13, 18]);
	});

	test("Postorder", () => {
		expect(tree.traverse("Postorder")).toEqual([1, 3, 4, 2, 8, 18, 13, 9, 6]);
	});
});

//      10
//     /  \
//    5    15
//  /\     /\
// 1  7   11  17
//     \
//     9

describe("Delete element.", () => {
	let tree: ReturnType<typeof binaryTree<number>>;
	beforeEach(() => {
		tree = binaryTree(10);
		tree.add(5);
		tree.add(1);
		tree.add(7);
		tree.add(9);
		tree.add(15);
		tree.add(11);
		tree.add(17);
	});

	test("Delete leaf node.", () => {
		tree.remove(11);
		expect(tree.traverse()).toEqual([1, 5, 7, 9, 10, 15, 17]);
	});

	test("Delete node with only one child.", () => {
		tree.remove(7);
		expect(tree.traverse()).toEqual([1, 5, 9, 10, 11, 15, 17]);
	});

	test("Delete node with two child from root left subtree.", () => {
		tree.remove(5);
		expect(tree.traverse()).toEqual([1, 7, 9, 10, 11, 15, 17]);
	});

	test("Delete node with two child from root right subtree.", () => {
		tree.remove(15);
		expect(tree.traverse()).toEqual([1, 5, 7, 9, 10, 11, 17]);
	});

	// test("Dot not allow root to be deleted.", () => {
	// 	expect(() => {
	// 		tree.remove(10);
	// 	}).toThrow();
	// });

	test("Delete element that is not in the tree.", () => {
		expect(tree.remove(100)).toBe(false);
	});
});

// ------------------------- Deno -------------------------
// https://dev.to/robdwaller/how-to-write-tests-in-deno-pen
// https://deno.land/manual@v1.36.4/basics/testing/assertions

// import { assertEquals, assertThrows } from "https://deno.land/std@0.201.0/assert/mod.ts";

// Deno.test("Element of type Object without sort function", () => {
// 	assertThrows(() => binaryTree({ name: "Michael", age: 20 }), Error, "Unable to sort tree.");
// });

// Deno.test("Element of type Function", () => {
// 	assertThrows(() => binaryTree({ name: "Michael", age: 20 }), Error, "Unable to sort tree.");
// });

// Deno.test("Traverse Inorder", () => {
// 	const tree = binaryTree(5);
// 	tree.add(2);
// 	tree.add(1);
// 	tree.add(3);
// 	tree.add(7);
// 	tree.add(6);
// 	tree.add(8);
// 	assertEquals(tree.traverse(), [1, 2, 3, 5, 6, 7, 8]);
// });

// Deno.test("Traverse Preorder", () => {
// 	const tree = binaryTree(5);
// 	tree.add(2);
// 	tree.add(1);
// 	tree.add(3);
// 	tree.add(7);
// 	tree.add(6);
// 	tree.add(8);
// 	assertEquals(tree.traverse("Preorder"), [5, 2, 1, 3, 7, 6, 8]);
// });

// Deno.test("Traverse Postorder", () => {
// 	const tree = binaryTree(5);
// 	tree.add(2);
// 	tree.add(1);
// 	tree.add(3);
// 	tree.add(7);
// 	tree.add(6);
// 	tree.add(8);
// 	assertEquals(tree.traverse("Postorder"), [1, 3, 2, 6, 8, 7, 5]);
// });

// Deno.test("Tree creation", () => {
// 	const tree = binaryTree(10);
// 	assertEquals(tree.traverse(), [10]);
// });

// Deno.test("Add node less than root", () => {
// 	const tree = binaryTree(10);
// 	tree.add(5);
// 	assertEquals(tree.traverse(), [5, 10]);
// });

// Deno.test("Add node greater than root", () => {
// 	const tree = binaryTree(10);
// 	tree.add(15);
// 	assertEquals(tree.traverse(), [10, 15]);
// });

// Deno.test("Add node equal to root", () => {
// 	const tree = binaryTree(10);
// 	tree.add(10);
// 	assertEquals(tree.traverse(), [10]);
// });
