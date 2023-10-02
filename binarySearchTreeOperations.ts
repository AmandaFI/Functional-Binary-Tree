import {
	connectNodes,
	createNode,
	hasBothChildren,
	inorderSuccessor,
	isLeaf,
	replaceRoot,
	updateSubtreeLevels,
} from "./binaryTreePrimitiveMethods";
import { CompareFnType, NodeType } from "./binaryTreeTypes";

export const addNode = <T extends {}>(element: T, node: NodeType<T>, compareFn: CompareFnType<T>) => {
	const comparison = compareFn(element, node.element);
	if (comparison === 0) return;
	else if (comparison === -1)
		node.left ? addNode(element, node.left, compareFn) : (node.left = createNode(element, node, "left"));
	else node.right ? addNode(element, node.right, compareFn) : (node.right = createNode(element, node, "right"));
};

export const deleteLeafNode = <T extends {}>(element: T, parent: NodeType<T> | null) => {
	if (!parent) throw new Error("Root deletion not allowed.");
	parent.left?.element === element ? (parent.left = null) : (parent.right = null);
};

export const deleteNodeWithOnlyChild = <T extends {}>(node: NodeType<T>, parent: NodeType<T> | null, root: NodeType<T>) => {
	const replacer = node.left ? node.left : node.right;
	if (!replacer) throw new Error("No replacer.");

	updateSubtreeLevels(replacer!, node.level, node.levelPosition);

	if (!parent) replaceRoot(root, replacer);
	else connectNodes(parent, replacer, parent.left?.element === node.element ? "left" : "right");
};

export const deleteNodeWithBothChildren = <T extends {}>(
	node: NodeType<T>,
	parent: NodeType<T> | null,
	root: NodeType<T>,
	compareFn: CompareFnType<T>
) => {
	const replacer = inorderSuccessor(node);
	if (!replacer) throw new Error("Node with two children without parent.");

	deleteNode(replacer.element, root, root, compareFn);
	if (!parent) root.element = replacer.element;
	else parent.left === node ? (parent.left.element = replacer.element) : (parent.right!.element = replacer.element);
};

export const deleteNode = <T extends {}>(
	element: T,
	node: NodeType<T> | null,
	root: NodeType<T>,
	compareFn: CompareFnType<T>
): boolean => {
	if (!node) return false;
	if (element === root.element && isLeaf(root)) throw new Error("Root deletion not allowed.");

	if (node.element === element) {
		if (isLeaf(node)) deleteLeafNode(element, node.parent);
		else if (hasBothChildren(node)) deleteNodeWithBothChildren(node, node.parent, root, compareFn);
		else deleteNodeWithOnlyChild(node, node.parent, root);
		return true;
	}
	if (compareFn!(element, node.element) === -1) return deleteNode(element, node.left, root, compareFn);
	else if (compareFn!(element, node.element) === 1) return deleteNode(element, node.right, root, compareFn);
	return false;
};

export const searchNode = <T extends {}>(value: T, node: NodeType<T>, compareFn: CompareFnType<T>): NodeType<T> | false => {
	const comparison = compareFn(value, node.element);
	if (comparison === 0) return node;
	if (comparison === -1 && node.left) return searchNode(value, node.left, compareFn);
	if (comparison === 1 && node.right) return searchNode(value, node.right, compareFn);
	return false;
};
