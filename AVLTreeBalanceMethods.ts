// https://www.enjoyalgorithms.com/blog/avl-tree-data-structure
// https://www.javatpoint.com/deletion-in-avl-tree

import { connectNodes, createNode, editNode, treeHeight, updateSubtreeLevels } from "./binaryTreePrimitiveMethods";
import { NodeType, RotationType } from "./binaryTreeTypes";

// balanceFactor = left - right
export const calculateBalanceFactor = <T extends {}>(node: NodeType<T> | null) => {
	if (!node) return 0;
	return treeHeight(node.left) - treeHeight(node.right);
};

export const isBalanced = <T extends {}>(node: NodeType<T> | null) => {
	const balanceFactor = calculateBalanceFactor(node);
	if (balanceFactor === -1 || balanceFactor === 0 || balanceFactor === 1) return true;
	return false;
};

export const checkAncestorsBalance = <T extends {}>(node: NodeType<T> | null) => {
	while (node !== null) {
		if (!isBalanced(node)) {
			console.log(`Node ${node.element} needs balance.`);
			balance(node);
		}
		node = node.parent;
	}
};

// Receives the unbalaned node.
export const choseRotation = <T extends {}>(node: NodeType<T>): RotationType | null => {
	const balanceFactor = calculateBalanceFactor(node);

	if (balanceFactor > 1) {
		if (calculateBalanceFactor(node.left) === 1) return "LL";
		return "LR";
	} else if (balanceFactor < -1) {
		if (calculateBalanceFactor(node.right) === -1) return "RR";
		return "RL";
	} else return null;
};

//       30 -> parent  (unbalanced)         20
//       /                                 /  \
//     20 -> node         --->           10    30
//     /
//   10 -> leftChild
//
// LL   --> This function receives the "center" node, in the example node 20.
export const rotateRight = <T extends {}>(node: NodeType<T> | null) => {
	if (node === null) throw new Error("Impossible to perform LL rotation with 'null' node.");

	const { element, parent, left: leftChild } = node;
	if (!parent) throw new Error("Impossible to execute LL rotation.");

	const rightChild = createNode(parent.element, parent, "right");

	if (parent.right) {
		connectNodes(rightChild, parent.right, "right");
		updateSubtreeLevels(parent.right, rightChild.level + 1, 2 * rightChild.levelPosition);
	}

	if (node.right) {
		connectNodes(rightChild, node.right, "left");
		updateSubtreeLevels(node.right, rightChild.level + 1, 2 * rightChild.levelPosition - 1);
	}

	editNode(parent, element, leftChild, rightChild);

	if (leftChild) {
		connectNodes(parent, leftChild, "left");
		updateSubtreeLevels(leftChild, leftChild.level - 1, 2 * parent.levelPosition - 1);
	}
};

//       10 -> parent  (unbalanced)        20
//        \                               /  \
//         20 -> node     --->          10    30
//          \
//           30 -> rightChild
//
// RR   --> This function receives the "center" node, in the example node 20.
export const rotateLeft = <T extends {}>(node: NodeType<T> | null) => {
	if (node === null) throw new Error("Impossible to perform RR rotation with 'null' node.");

	const { element, parent, right: rightChild } = node;
	if (!parent) throw new Error("Impossible to execute RR rotation.");

	const leftChild = createNode(parent.element, parent, "left");

	if (parent.left) {
		connectNodes(leftChild, parent.left, "left");
		updateSubtreeLevels(parent.left, leftChild.level + 1, 2 * leftChild.levelPosition - 1);
	}

	if (node.left) {
		connectNodes(leftChild, node.left, "right");
		updateSubtreeLevels(node.left, leftChild.level + 1, 2 * leftChild.levelPosition);
	}

	editNode(parent, element, leftChild, rightChild);

	if (rightChild) {
		connectNodes(parent, rightChild, "right");
		updateSubtreeLevels(rightChild, parent.level + 1, 2 * parent.levelPosition);
	}
};
//     30 (unbalanced)     30                20
//    /       RR           /       LL       /  \
//   10       --->       20        -->     10   30
//     \                 /
//      20             10
//
// LR --> This function receives the "center" node, in the example node 10 from the first tree.
export const rotateLeftRight = <T extends {}>(node: NodeType<T> | null) => {
	if (node === null) throw new Error("Impossible to perform rotation LR with 'null' node.");

	rotateLeft(node.right!);
	rotateRight(node);
};

//    10  (unbalanced)     10                20
//      \     LL            \      RR       /  \
//      30    --->          20     -->     10   30
//     /                     \
//   20                      30
//
// RL --> This function receives the "center" node, in the example node 30 from the first tree.
export const rotateRightLeft = <T extends {}>(node: NodeType<T> | null) => {
	if (node === null) throw new Error("Impossible to perform rotation RL with 'null' node.");

	rotateRight(node.left!);
	rotateLeft(node);
};

export const balance = <T extends {}>(node: NodeType<T>) => {
	const rotation = choseRotation(node);
	console.log(`Executing ${rotation} rotation...`);
	switch (rotation) {
		case "LL":
			rotateRight(node.left);
			break;
		case "RL":
			rotateRightLeft(node.right);
			break;
		case "RR":
			rotateLeft(node.right);
			break;
		case "LR":
			rotateLeftRight(node.left);
			break;
		default:
			throw new Error("No rotation needed.");
	}
};
