import { checkAncestorsBalance, checkAncestorsBalance2 } from "./AVLTreeBalanceMethods";
import { addNode, searchNode } from "./binarySearchTreeOperations";
import { filterTree, forEachElement, mapTree, reduceTree, traverseTree } from "./binaryTreeIterationMethods";
import {
	connectNodes,
	createNode,
	defineCompareFn,
	displayTreeInline,
	displayTreePyramid,
	hasBothChildren,
	inorderSuccessor,
	isLeaf,
	leftMostElement,
	replaceRoot,
	rightMostElement,
	treeHeight,
	updateSubtreeLevels,
} from "./binaryTreePrimitiveMethods";
import { CompareFnType, FilterFnType, ForEachFnType, MapFnType, NodeType, OrderType, ReduceFnType } from "./binaryTreeTypes";

// CORRECT DELETION
const AVLTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const root: NodeType<T> = createNode<T>(rootElement);
	compareFn = defineCompareFn(compareFn);

	const add = (element: T) => {
		const addedNode = addNode(element, root, compareFn!);
		checkAncestorsBalance(addedNode);
	};

	// ---------------------------------------------------------------------------------

	const deleteLeafNode = (element: T, parent: NodeType<T> | null) => {
		console.log(`Leaf deletion ${element}`);
		if (!parent) throw new Error("Root deletion not allowed.");
		parent.left?.element === element ? (parent.left = null) : (parent.right = null);
		return parent;
	};

	const deleteNodeWithOnlyChild = (node: NodeType<T>, parent: NodeType<T> | null, root: NodeType<T>): NodeType<T> => {
		const replacer = node.left ? node.left : node.right;
		if (!replacer) throw new Error("No replacer.");

		updateSubtreeLevels(replacer!, node.level, node.levelPosition);

		if (!parent) {
			replaceRoot(root, replacer);
			return root;
		} else connectNodes(parent, replacer, parent.left?.element === node.element ? "left" : "right");
		return parent;
	};

	const deleteNodeWithBothChildren = (
		node: NodeType<T>,
		parent: NodeType<T> | null,
		root: NodeType<T>,
		compareFn: CompareFnType<T>
	): NodeType<T> => {
		const replacer = inorderSuccessor(node);
		if (!replacer) throw new Error("Node with two children without parent.");

		deleteNode(replacer.element, root, root, compareFn);
		if (!parent) {
			root.element = replacer.element;
			return root;
		} else {
			if (parent.left === node) {
				parent.left.element = replacer.element;
				return parent.left;
			} else {
				parent.right!.element = replacer.element;
				return parent.right!;
			}
		}
	};

	// ---------------------------------------------------------------------------------

	const deleteNode = (
		element: T,
		node: NodeType<T> | null,
		root: NodeType<T>,
		compareFn: CompareFnType<T>
	): NodeType<T> | null => {
		if (!node) return null;
		if (element === root.element && isLeaf(root)) throw new Error("Root deletion not allowed.");
		let rNode: NodeType<T> | null = null;
		if (node.element === element) {
			if (isLeaf(node)) {
				//console.log(`Deleted Node parent: ${rNode.element}`);
				return deleteLeafNode(element, node.parent);
				//const deletedNodeParent = deleteLeafNode(element, node.parent);
				//checkAncestorsBalance2(deletedNodeParent);
			} else if (hasBothChildren(node)) {
				console.log(`Deleted Node two children`);
				return deleteNodeWithBothChildren(node, node.parent, root, compareFn);
				//const replacedNode = deleteNodeWithBothChildren(node, node.parent, root, compareFn);
				//checkAncestorsBalance2(replacedNode);
			} else {
				//console.log(`Deleted Node parent: ${rNode.element}`);
				return deleteNodeWithOnlyChild(node, node.parent, root);
				//const removedNodeParent = deleteNodeWithOnlyChild(node, node.parent, root);

				//checkAncestorsBalance2(removedNodeParent);
			}
			//checkAncestorsBalance2(rNode);
			//return true;
		}
		if (compareFn!(element, node.element) === -1) return deleteNode(element, node.left, root, compareFn);
		else if (compareFn!(element, node.element) === 1) return deleteNode(element, node.right, root, compareFn);
		return null;
	};

	const remove = (element: T) => {
		const x = deleteNode(element, root, root, compareFn!);
		pyramidDisplay();
		if (x !== null) checkAncestorsBalance2(x);
		else console.log("ERRO NA DELEÇÃO");
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

	return { root, add, pyramid: displayTreePyramid, remove };
};

const tree = AVLTree(2);
tree.add(1);
tree.add(3);
tree.add(4);
tree.pyramid(tree.root);
tree.add(5);
tree.add(6);
tree.add(7);
tree.add(8);

// tree.remove(10);
tree.pyramid(tree.root);

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

// tree.pyramid(tree.root);

// tree.remove(10);

// tree.pyramid(tree.root);

// const tree = AVLTree(50);
// tree.add(40);

// tree.add(60);
// tree.add(30);
// tree.add(45);
// tree.add(55);
// tree.add(10);

// tree.pyramid(tree.root);

// tree.remove(55);

// tree.pyramid(tree.root);

// const tree = AVLTree(20);
// console.log(tree.root.element);
// console.log(tree.root.parent);

// tree.add(10);
// // tree.pyramid(tree.root);

// tree.add(30);

// tree.add(5);

// tree.add(15);

// tree.pyramid(tree.root);
// console.log("befor deletion");
// tree.remove(30);
// console.log("------------------------------after deletion");

// tree.pyramid(tree.root);
// // console.log(tree.root.left!);
