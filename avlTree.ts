import { checkAncestorsBalance } from "./AVLTreeBalanceMethods";
import { addNode, deleteNode, searchNode } from "./binarySearchTreeOperations";
import { filterTree, forEachElement, mapTree, reduceTree, traverseTree } from "./binaryTreeIterationMethods";
import {
	createNode,
	defineCompareFn,
	displayTreeInline,
	displayTreePyramid,
	leftMostElement,
	rightMostElement,
	treeHeight,
} from "./binaryTreePrimitiveMethods";
import { CompareFnType, FilterFnType, ForEachFnType, MapFnType, NodeType, OrderType, ReduceFnType } from "./binaryTreeTypes";

const AVLTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const root: NodeType<T> = createNode<T>(rootElement);
	compareFn = defineCompareFn(compareFn);

	const add = (element: T) => {
		const addedNode = addNode(element, root, compareFn!);
		checkAncestorsBalance(addedNode.parent);
	};

	const remove = (element: T) => {
		const removedReplacer = deleteNode(element, root, root, compareFn!);
		if (removedReplacer !== false) checkAncestorsBalance(removedReplacer);
	};

	const search = (element: T) => (searchNode(element, root, compareFn!) ? true : false);
	const height = (rootNode: NodeType<T> = root) => treeHeight(rootNode);
	const min = (node: NodeType<T> = root): T => leftMostElement(node);
	const max = (node: NodeType<T> = root): T => rightMostElement(node);
	const display = () => displayTreeInline(root);
	const traverse = (order: OrderType = "Inorder") => traverseTree(order, root);
	const map = (fn: MapFnType<T>, order: OrderType = "Inorder") => mapTree(fn, root, order);
	const filter = (fn: FilterFnType<T>, order: OrderType = "Inorder") => filterTree(fn, root, order);
	const reduce = (fn: ReduceFnType<T>, acc: any) => reduceTree(fn, acc, root);
	const forEach = (fn: ForEachFnType<T>) => forEachElement(fn, root);
	const pyramidDisplay = () => displayTreePyramid(root);

	return {
		root,
		add,
		pyramidDisplay,
		remove,
		search,
		height,
		min,
		max,
		display,
		traverse,
		map,
		filter,
		reduce,
		forEach,
	};
};

const tree = AVLTree(10);
tree.add(5);
tree.pyramidDisplay();
tree.add(3);
tree.pyramidDisplay();
tree.add(1);
tree.pyramidDisplay();
tree.add(2);
tree.pyramidDisplay();
tree.add(4);
tree.pyramidDisplay();
tree.add(15);
tree.pyramidDisplay();
tree.add(19);
tree.pyramidDisplay();
// const tree = AVLTree(2);
// tree.add(1);
// tree.add(3);
// tree.add(4);
// tree.pyramidDisplay();
// tree.add(5);
// tree.add(6);
// tree.add(7);
// tree.add(8);

// // tree.remove(10);
// tree.pyramidDisplay();

// const tree = AVLTree(30);
// tree.add(10);
// tree.add(50);
// tree.add(6);
// tree.add(18);
// tree.add(45);
// tree.add(58);

// tree.add(5);
// tree.add(8);
// tree.add(15);
// tree.add(47);
// tree.add(65);
// tree.add(7);
// tree.add(9);

// tree.pyramidDisplay();

// tree.remove(10);

// tree.pyramidDisplay();

// const tree = AVLTree(50);
// tree.add(40);

// tree.add(60);
// tree.add(30);
// tree.add(45);
// tree.add(55);
// tree.add(10);

// tree.pyramidDisplay();

// tree.remove(55);

// tree.pyramidDisplay();

// const tree = AVLTree(20);
// console.log(tree.root.element);
// console.log(tree.root.parent);

// tree.add(10);
// // tree.pyramidDisplay();

// tree.add(30);

// tree.add(5);

// tree.add(15);

// tree.pyramidDisplay();
// console.log("befor deletion");
// tree.remove(30);
// console.log("------------------------------after deletion");

// tree.pyramidDisplay();
// // console.log(tree.root.left!);
