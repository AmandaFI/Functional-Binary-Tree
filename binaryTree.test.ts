// ---------------------------------------------------- Obs ----------------------------------------------------
// --> Testar comportamento e não implementação. (comportamento pode ser entendido também como API)
// --> Funções privadas de uma classe ou métodos não expostos de um objeto fazem parte da implementação, portanto não devem ser testados.

// ---------------------------------------------------- Binary Tree API ----------------------------------------------------
// Create tree   -
// Add element  -
// Delete element  -
// Search for element   -
// Traverse (inorder, preorder, postorder)   -
// Height   -
// Depth -
// Max -
// Min  -
// Lowest common ancestor -
// Map -
// Filter -
// Reduce
// Foreach
// Node count
// Validate

// ---------------------------------------------------- Tests ----------------------------------------------------

import { binarySearchTree } from "./binarySearchTree";

describe("Create tree:", () => {
	type Person = {
		name: string;
		age: number;
	};

	test("With object type elements without comparison function.", () => {
		expect(() => {
			binarySearchTree<Person>({ name: "Michael", age: 45 });
		}).toThrow();
	});

	test("With function type element.", () => {
		expect(() => {
			binarySearchTree(() => 1);
		}).toThrow();
	});

	test("Normally", () => {
		expect(binarySearchTree(10).root).toEqual({
			element: 10,
			left: null,
			right: null,
			parent: null,
			level: 0,
			levelPosition: 1,
			parentSide: null,
		});
	});
});

//      6
//     /  \
//    2    9
//  /\     /\
// 1  4   8  13
//    /       \
//   3         18

// (6 (2 (1) (4 (3) ()))(9))

describe("Immutable actions:", () => {
	let tree: ReturnType<typeof binarySearchTree<number>>;
	beforeAll(() => {
		tree = binarySearchTree(6);
		tree.add(2);
		tree.add(1);
		tree.add(4);
		tree.add(3);
		tree.add(9);
		tree.add(8);
		tree.add(13);
		tree.add(18);
	});

	describe("Traverse tree:", () => {
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

	describe("Search:", () => {
		test("Element that exists as a leaf node.", () => {
			expect(tree.search(1)).toBe(true);
		});

		test("Element that exists as a one child node.", () => {
			expect(tree.search(13)).toBe(true);
		});

		test("Element that exists as a two children node.", () => {
			expect(tree.search(9)).toBe(true);
		});

		test("Element that does not exists in the tree.", () => {
			expect(tree.search(100)).toBe(false);
		});
	});

	describe("Node hegiht:", () => {
		test("Leaf.", () => {
			expect(tree.height(tree.root.left!.left!)).toBe(1);
		});

		test("Root.", () => {
			expect(tree.height(tree.root)).toBe(4);
		});

		test("Subtree.", () => {
			expect(tree.height(tree.root.right!)).toBe(3);
		});
	});

	describe("Node depth:", () => {
		test("Leaf.", () => {
			expect(tree.root.left!.left!.level).toBe(2);
		});

		test("Root.", () => {
			expect(tree.root.level).toBe(0);
		});

		test("Subtree.", () => {
			expect(tree.root.right!.level).toBe(1);
		});
	});

	describe("Lowest common ancestor between 2 nodes:", () => {
		test("One is parent of the other.", () => {
			const acestor = tree.lowestCommonAncestor(4, 3);
			expect(acestor ? acestor.element : false).toBe(4);
		});

		test("Both in the same subtree.", () => {
			const acestor = tree.lowestCommonAncestor(2, 3);
			expect(acestor ? acestor.element : false).toBe(2);
		});

		test("Elements in different subtrees.", () => {
			const acestor = tree.lowestCommonAncestor(8, 13);
			expect(acestor ? acestor.element : false).toBe(9);
		});

		// test("Node not in tree.", () => {
		// 	expect(tree.root.right!.level).toBe(1);
		// });
	});

	describe("Minimun element:", () => {
		test("Leaf node.", () => {
			expect(tree.min(tree.root.right!.left!)).toBe(8);
		});

		test("One child node.", () => {
			expect(tree.min(tree.root.left!.right!)).toBe(3);
		});

		test("Two child node.", () => {
			expect(tree.min(tree.root.right!)).toBe(8);
		});

		test("Tree.", () => {
			expect(tree.min(tree.root)).toBe(1);
		});
	});

	describe("Maximun element:", () => {
		test("Leaf node.", () => {
			expect(tree.max(tree.root.right!.left!)).toBe(8);
		});

		test("One child node.", () => {
			expect(tree.max(tree.root.left!.right!)).toBe(4);
		});

		test("Two child node.", () => {
			expect(tree.max(tree.root.right!)).toBe(18);
		});

		test("Tree.", () => {
			expect(tree.max(tree.root)).toBe(18);
		});
	});

	describe("Map:", () => {
		test("Function without index default order.", () => {
			expect(tree.map(el => el ** 2)).toEqual([1, 4, 9, 16, 36, 64, 81, 169, 324]);
		});

		test("Function with index deafult order.", () => {
			expect(tree.map((el, index) => el + index!)).toEqual([1, 3, 5, 7, 10, 13, 15, 20, 26]);
		});

		test("Function without index specific order.", () => {
			expect(tree.map(el => el ** 2, "Preorder")).toEqual([36, 4, 1, 16, 9, 81, 64, 169, 324]);
		});

		test("Function with index specific order.", () => {
			expect(tree.map((el, index) => el + index!, "Preorder")).toEqual([6, 3, 3, 7, 7, 14, 14, 20, 26]);
		});
	});

	describe("Filter:", () => {
		test("Function without index default order.", () => {
			expect(tree.filter(el => el % 2 === 0)).toEqual([2, 4, 6, 8, 18]);
		});

		test("Function with index deafult order.", () => {
			expect(tree.filter((el, index) => el + index! > 6)).toEqual([4, 6, 8, 9, 13, 18]);
		});

		test("Function without index specific order.", () => {
			expect(tree.filter(el => el % 2 === 0, "Preorder")).toEqual([6, 2, 4, 8, 18]);
		});

		test("Function with index specific order.", () => {
			expect(tree.filter((el, index) => el + index! > 6, "Preorder")).toEqual([4, 3, 9, 8, 13, 18]);
		});
	});
});

describe("Mutable actions:", () => {
	let tree: ReturnType<typeof binarySearchTree<number>>;
	beforeAll(() => (tree = binarySearchTree(6)));

	describe("Add:", () => {
		test("Element equal to the root.", () => {
			tree.add(6);
			expect(tree.root.left).toBe(null);
		});

		test("Left child to root.", () => {
			tree.add(2);
			expect(tree.root.left?.element).toBe(2);
			expect(tree.root.left?.parent?.element).toBe(6);
		});

		test("Left child to left root subtree.", () => {
			tree.add(1);
			expect(tree.root.left?.left ? tree.root.left?.left.element : false).toBe(1);
			expect(tree.root.left?.left ? tree.root.left?.left.parent?.element : false).toBe(2);
		});

		test("Right child to left root subtree.", () => {
			tree.add(4);
			expect(tree.root.left?.right ? tree.root.left?.right.element : false).toBe(4);
			expect(tree.root.left?.right ? tree.root.left?.right.parent?.element : false).toBe(2);
		});

		test("Right child to root.", () => {
			tree.add(9);
			expect(tree.root.right?.element).toBe(9);
			expect(tree.root.right?.parent?.element).toBe(6);
		});

		test("Left child to right root subtree.", () => {
			tree.add(8);
			expect(tree.root.right?.left ? tree.root.right?.left.element : false).toBe(8);
			expect(tree.root.right?.left ? tree.root.right?.left.parent?.element : false).toBe(9);
		});

		test("Right child to right root subtree.", () => {
			tree.add(13);
			expect(tree.root.right?.right ? tree.root.right?.right.element : false).toBe(13);
			expect(tree.root.right?.right ? tree.root.right?.right.parent?.element : false).toBe(9);
		});

		test("Element already in the tree.", () => {
			tree.add(8);
			expect(tree.traverse()).toEqual([1, 2, 4, 6, 8, 9, 13]);
		});
	});

	describe("Delete:", () => {
		beforeEach(() => {
			tree.add(3);
			tree.add(18);
		});

		test("Leaf node.", () => {
			tree.remove(3);
			expect(tree.root.left?.right?.left).toBe(null);
			expect(tree.traverse()).toEqual([1, 2, 4, 6, 8, 9, 13, 18]);
		});

		test("Node with only one child.", () => {
			tree.remove(13);
			expect(tree.root.right?.right?.element).toBe(18);
			expect(tree.root.right?.right?.parent?.element).toBe(9);
			expect(tree.root.right?.right?.level!).toBe(2);
			expect(tree.traverse()).toEqual([1, 2, 3, 4, 6, 8, 9, 18]);
		});

		test("Node with two child from root left subtree.", () => {
			tree.remove(2);
			expect(tree.root.left?.element).toBe(3);
			expect(tree.root.left?.parent?.element).toBe(6);
			expect(tree.traverse()).toEqual([1, 3, 4, 6, 8, 9, 18]);
		});

		test("Node with two child from root right subtree.", () => {
			tree.remove(9);
			expect(tree.root.right?.element).toBe(18);
			expect(tree.root.right?.parent?.element).toBe(6);
			expect(tree.traverse()).toEqual([1, 3, 4, 6, 8, 18]);
		});

		test("Root but tree still has other nodes.", () => {
			tree.remove(6);
			expect(tree.root.element).toBe(8);
			expect(tree.root.right?.element).toBe(18);
			expect(tree.traverse()).toEqual([1, 3, 4, 8, 18]);
		});

		test("Element that is not in the tree.", () => {
			expect(tree.remove(100)).toBe(false);
		});

		test("Root when it is the only tree node remaining.", () => {
			tree.remove(18);
			tree.remove(1);
			tree.remove(4);
			tree.remove(3);
			expect(() => {
				tree.remove(8);
			}).toThrow();
		});
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
