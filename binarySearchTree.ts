// print
// encontrar a maior arvore balanceada 'dentro' da arvore
// using cached inOrderTraverse result
// FAZER TESTES DE TUDO
// arrumar reduce

import {
	defineCompareFn,
	updateSubtreeLevels,
	inorderSuccessor,
	isLeaf,
	hasBothChildren,
	leftMostElement,
	rightMostElement,
	displayTreeInline,
	displayTreePyramid,
	treeHeight,
	createNode,
	replaceRoot,
	connectNodes,
} from "./binaryTreePrimitiveMethods";
import { CompareFnType, FilterFnType, ForEachFnType, MapFnType, NodeType, OrderType, ReduceFnType } from "./binaryTreeTypes";
import { filterTree, forEachElement, mapTree, reduceTree, traverseTree, visitElements } from "./binaryTreeIterationMethods";

// -----------------------------------------------OBS------------------------------------------------------------------
// coisas que querem iterar pelos nodes utilizam o visit e os que querem iterar pelos elements utilizam o iterator
// nada impediria de ter 2 iterators, um que retornasse nodes array e outro que retornasse elements array
// --------------------------------------------------------------------------------------------------------------------

// https://www.freecodecamp.org/news/binary-search-tree-traversal-inorder-preorder-post-order-for-bst/

// classes em formato de função são uma forma de ter private em metodos e atributos
// python, javascript, entre outras o private não "existe" realmente

const binarySearchTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const root: NodeType<T> = createNode<T>(rootElement);
	compareFn = defineCompareFn(compareFn);

	const addNode = (element: T, node: NodeType<T> = root) => {
		const comparison = compareFn!(element, node.element);
		if (comparison === 0) return;
		else if (comparison === -1) node.left ? addNode(element, node.left) : (node.left = createNode(element, node, "left"));
		else node.right ? addNode(element, node.right) : (node.right = createNode(element, node, "right"));
	};

	const deleteLeafNode = (element: T, parent: NodeType<T> | null) => {
		if (!parent) throw new Error("Root deletion not allowed.");
		parent.left?.element === element ? (parent.left = null) : (parent.right = null);
	};

	const deleteNodeWithOnlyChild = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacer = node.left ? node.left : node.right;
		if (!replacer) throw new Error("No replacer.");

		updateSubtreeLevels(replacer!, node.level, node.levelPosition);

		if (!parent) replaceRoot(root, replacer);
		else connectNodes(parent, replacer, parent.left?.element === node.element ? "left" : "right");
	};

	const deleteNodeWithBothChildren = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacer = inorderSuccessor(node);
		if (!replacer) throw new Error("Node with two children without parent.");

		deleteNode(replacer.element);
		if (!parent) root.element = replacer.element;
		else parent.left === node ? (parent.left.element = replacer.element) : (parent.right!.element = replacer.element);
	};

	const deleteNode = (element: T, node: NodeType<T> | null = root): boolean => {
		if (!node) return false;
		if (element === root.element && isLeaf(root)) throw new Error("Root deletion not allowed.");

		if (node.element === element) {
			if (isLeaf(node)) deleteLeafNode(element, node.parent);
			else if (hasBothChildren(node)) deleteNodeWithBothChildren(node, node.parent);
			else deleteNodeWithOnlyChild(node, node.parent);
			return true;
		}
		if (compareFn!(element, node.element) === -1) return deleteNode(element, node.left);
		else if (compareFn!(element, node.element) === 1) return deleteNode(element, node.right);
		return false;
	};

	const searchNode = (value: T, node: NodeType<T> = root): NodeType<T> | false => {
		const comparison = compareFn!(value, node.element);
		if (comparison === 0) return node;
		if (comparison === -1 && node.left) return searchNode(value, node.left);
		if (comparison === 1 && node.right) return searchNode(value, node.right);
		return false;
	};

	const add = (element: T) => addNode(element);
	const remove = (element: T) => deleteNode(element);
	const search = (element: T) => (searchNode(element) ? true : false);
	const height = (rootNode: NodeType<T> = root) => treeHeight(rootNode);
	const min = (node: NodeType<T> = root): T => leftMostElement(node);
	const max = (node: NodeType<T> = root): T => rightMostElement(node);
	const display = () => displayTreeInline(root);
	const traverse = (order: OrderType = "Inorder") => traverseTree(order, root);
	const map = (fn: MapFnType<T>, order: OrderType = "Inorder") => mapTree(fn, root, order);
	const filter = (fn: FilterFnType<T>, order: OrderType = "Inorder") => filterTree(fn, root, order);
	const reduce = (fn: ReduceFnType<T>, acc: any) => reduceTree(fn, acc, root);
	const forEach = (fn: ForEachFnType<T>) => forEachElement(fn, root);
	const pyramidDisplpay = () => displayTreePyramid(root);

	return {
		root,
		add,
		remove,
		search,
		min,
		max,
		height,
		display,
		traverse,
		[Symbol.iterator]: () => visitElements("Inorder", root), // Iterable returns a Iterator
		map,
		filter,
		reduce,
		forEach,
		pyramidDisplpay,
	};
};

export { binarySearchTree };

//      6
//     /  \
//    2    9
//  /\     /\
// 1  4   8  13
//    /       \
//   3         18

const tree = binarySearchTree(6);
tree.add(4);
tree.add(3);
// tree.add(4);
// tree.add(3);
// tree.add(9);
// tree.add(8);
// tree.add(13);
// tree.add(18);

// let b = tree.inorderPredecessor(tree.root.left!.right!);
// console.log(b ? b.element : "no");
tree.remove(6);
tree.pyramidDisplpay();

tree.add(2);
tree.add(1);
tree.add(8);

// let a = tree.lowestCommonAncestor(1, 23);
// const a = tree.lowestCommonAncestor(4, 6);
// const a = tree.lowestCommonAncestor(3, 4);
// const a = tree.lowestCommonAncestor(2, 4);
// const a = tree.lowestCommonAncestor(3, 189);

// console.log(a ? a.element : "no");

tree.pyramidDisplpay();

// function inorderSucessor(node: NodeType<T>) {
// 	throw new Error("Function not implemented.");
// }
// tree.remove(1);

// tree.remove(2);
// tree.pyramid();

// tree.displayTreeInline();
// tree.testDisplay();

// let a = tree.visitIterator();
// //console.log([...a]);
// console.log([...tree]);

// // // console.log(tree.validate(tree.root.right!));
// // tree.remove(10);
console.log(tree.traverse());
