// jest for typescript --> https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/#jest-config-file
// globals --> https://jestjs.io/docs/api
// expect options --> https://jestjs.io/docs/expect

// install:
// npm install --save-dev jest typescript ts-jest @types/jest
// npx ts-jest config:init

// run tests -> npx jest

import { binaryTree } from "./binaryTree";

describe("Create node:", () => {
	let tree: ReturnType<typeof binaryTree<number>>;
	beforeEach(() => (tree = binaryTree(1)));
	test("Without parent", () => {
		expect(tree.createNode(10)).toEqual({ element: 10, left: null, right: null, parent: null });
	});

	test("With parent", () => {
		expect(tree.createNode(10, tree.root)).toEqual({
			element: 10,
			left: null,
			right: null,
			parent: { element: 1, left: null, right: null, parent: null },
		});
	});
});

describe("Create tree:", () => {
	test("With object type elements without comparison function.", () => {
		expect(() => {
			binaryTree({ name: "Michael", age: 45 });
		}).toThrow();
	});

	test("With function type element.", () => {
		expect(() => {
			binaryTree(() => 1);
		}).toThrow();
	});
});

//      6
//     /  \
//    2    9
//  /\     /\
// 1  4   8  13
//    /       \
//   3         18
// USAR CREATE NODE
describe("Traverse tree:", () => {
	let tree: ReturnType<typeof binaryTree<number>>;
	beforeEach(() => {
		tree = binaryTree(6);
		tree.root.left = tree.createNode(2, tree.root);
		tree.root.left.left = tree.createNode(1, tree.root.left);
		tree.root.left.right = tree.createNode(4, tree.root.left);
		tree.root.left.right.left = tree.createNode(3, tree.root.left.right);
		tree.root.right = tree.createNode(9, tree.root);
		tree.root.right.left = tree.createNode(8, tree.root.right);
		tree.root.right.right = tree.createNode(13, tree.root.right);
		tree.root.right.right.right = tree.createNode(18, tree.root.right.right);
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

describe("Add:", () => {
	let tree: ReturnType<typeof binaryTree<number>>;
	beforeEach(() => (tree = binaryTree(10)));

	test("Left child to root.", () => {
		tree.add(5);
		expect(tree.traverse()).toEqual([5, 10]);
	});

	test("Left child to left root subtree.", () => {
		tree.add(5);
		tree.add(1);
		expect(tree.traverse()).toEqual([1, 5, 10]);
	});

	test("Right child to left root subtree.", () => {
		tree.add(5);
		tree.add(7);
		expect(tree.traverse()).toEqual([5, 7, 10]);
	});

	test("Right child to root.", () => {
		tree.add(15);
		expect(tree.traverse()).toEqual([10, 15]);
	});

	test("Left child to right root subtree.", () => {
		tree.add(15);
		tree.add(11);
		expect(tree.traverse()).toEqual([10, 11, 15]);
	});

	test("Right child to right root subtree.", () => {
		tree.add(15);
		tree.add(17);
		expect(tree.traverse()).toEqual([10, 15, 17]);
	});
});

//      10
//     /  \
//    5    15
//  /\     /
// 1  7   12
//     \  /
//     9  11

describe("Replace:", () => {
	let tree: ReturnType<typeof binaryTree<number>>;
	beforeEach(() => {
		tree = binaryTree(10);
		tree.add(5);
		tree.add(1);
		tree.add(7);
		tree.add(9);
		tree.add(15);
		tree.add(12);
		tree.add(11);
	});

	test("Root.", () => {
		const replacer = tree.inOrderReplacer(tree.root);
		expect(replacer ? replacer.element : false).toBe(11);
	});

	test("Node with right subtree only.", () => {
		const replacer = tree.inOrderReplacer(tree.root.left!.right!);
		expect(replacer ? replacer.element : false).toBe(9);
	});

	test("Node with left subtree only.", () => {
		const replacer = tree.inOrderReplacer(tree.root.right!.left!);
		expect(replacer ? replacer.element : false).toBe(15);
	});

	test("Node with left and right subtrees.", () => {
		const replacer = tree.inOrderReplacer(tree.root.left!);
		expect(replacer ? replacer.element : false).toBe(7);
	});

	test("Greatest tree node.", () => {
		const replacer = tree.inOrderReplacer(tree.root.right!);
		expect(replacer ? replacer.element : false).toBe(false);
	});

	// test("Smallest tree node.", () => {
	// 	expect(tree.remove(100)).toBe(false);
	// });
});

//      10
//     /  \
//    5    15
//  /\     /\
// 1  7   11  17
//     \
//     9

describe("Delete:", () => {
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

	test("Leaf node.", () => {
		tree.remove(11);
		expect(tree.traverse()).toEqual([1, 5, 7, 9, 10, 15, 17]);
	});

	test("Node with only one child.", () => {
		tree.remove(7);
		expect(tree.traverse()).toEqual([1, 5, 9, 10, 11, 15, 17]);
	});

	test("Node with two child from root left subtree.", () => {
		tree.remove(5);
		expect(tree.traverse()).toEqual([1, 7, 9, 10, 11, 15, 17]);
	});

	test("Node with two child from root right subtree.", () => {
		tree.remove(15);
		expect(tree.traverse()).toEqual([1, 5, 7, 9, 10, 11, 17]);
	});

	test("Root but tree still has other nodes.", () => {
		tree.remove(10);
		expect(tree.traverse()).toEqual([1, 5, 7, 9, 11, 15, 17]);
	});

	test("Element that is not in the tree.", () => {
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
