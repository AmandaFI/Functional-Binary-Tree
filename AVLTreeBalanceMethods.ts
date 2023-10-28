// https://en.wikipedia.org/wiki/AVL_tree
// https://www.enjoyalgorithms.com/blog/avl-tree-data-structure

import { createNode, editNode, editNodePosition, treeHeight, updateSubtreeLevels } from "./binaryTreePrimitiveMethods";
import { NodeType, RotationType } from "./binaryTreeTypes";

export const calculateBalanceFactor = <T extends {}>(node: NodeType<T> | null) => {
	if (!node) return 0;
	return treeHeight(node.left) - treeHeight(node.right);
};

export const isBalanced = <T extends {}>(node: NodeType<T> | null) => {
	const balanceFactor = calculateBalanceFactor(node);
	if (balanceFactor === -1 || balanceFactor === 0 || balanceFactor === 1) return true;
	console.log(`Imbalance: ${balanceFactor}`);
	return false;
};

export const choseRotation = <T extends {}>(node: NodeType<T>): RotationType | null => {
	const balanceFactor = calculateBalanceFactor(node);
	console.log("Choosing rotation");
	console.log(`Calculated balane: ${balanceFactor}`);

	if (balanceFactor > 1) {
		if (calculateBalanceFactor(node.left) === 1) return "LL";
		return "LR";
	} else if (balanceFactor < -1) {
		if (calculateBalanceFactor(node.right) === -1) return "RR";
		return "RL";
	} else return null;
};

export const checkAncestorsBalance = <T extends {}>(node: NodeType<T> | null) => {
	while (node !== null) {
		console.log(`Checking node ${node.element}`);
		if (!isBalanced(node)) {
			console.log(`Node ${node.element} needs balance`);
			balance(node);
		}
		node = node.parent;
	}
};

//       30                        20
//       /                        /  \
//     20          --->         10    30
//     /
//   10
// LL   --> This function receives the "center" node, in the example node 20
export const rotateRight = <T extends {}>(node: NodeType<T> | null) => {
	if (node === null) throw new Error("Impossible to perform rotation LL with null node.");

	const { element, parent, left: leftChild, levelPosition } = node;
	console.log(`Received node ${element} to rotate LL.`);

	if (!parent) throw new Error("Impossible to execute LL rotation.");
	const rightChild = createNode(parent.element, parent, "right");
	rightChild.left = node.right;

	if (parent.right) {
		rightChild.right = parent.right;
		parent.right.parent = rightChild;
		parent.right.parentSide = "right";
		updateSubtreeLevels(parent.right, rightChild.level + 1, 2 * rightChild.levelPosition);
	}

	if (node.right) {
		node.right.parent = rightChild;
		editNodePosition(node.right, rightChild.level + 1, 2 * rightChild.levelPosition - 1, "left");
	}
	editNode(parent, element, leftChild, rightChild);

	if (leftChild) {
		leftChild.parent = parent;
		updateSubtreeLevels(leftChild, leftChild.level - 1, 2 * parent.levelPosition - 1);
	}
};

//       10                       20
//        \                      /  \
//         20      --->        10    30
//          \
//           30
// RR   --> This function receives the "center" node, in the example node 20
export const rotateLeft = <T extends {}>(node: NodeType<T> | null) => {
	if (node === null) throw new Error("Impossible to perform rotation RR with null node.");

	const { element, parent, right: rightChild, levelPosition } = node;
	console.log(`Received node ${element} to rotate RR.`);

	if (!parent) throw new Error("Impossible to execute RR rotation.");
	const leftChild = createNode(parent.element, parent, "left");
	leftChild.right = node.left;

	if (parent.left) {
		leftChild.left = parent.left;
		parent.left.parent = leftChild;
		parent.left.parentSide = "left";
		updateSubtreeLevels(parent.left, leftChild.level + 1, 2 * leftChild.levelPosition - 1);
	}

	if (node.left) {
		node.left.parent = leftChild;
		editNodePosition(node.left, leftChild.level + 1, 2 * leftChild.levelPosition, "right");
	}
	editNode(parent, element, leftChild, rightChild);

	if (rightChild) {
		rightChild.parent = parent;
		updateSubtreeLevels(rightChild, parent.level + 1, 2 * parent.levelPosition);
		//editNodePosition(rightChild, parent.level + 1, 2 * parent.levelPosition, "right");
	}
};
//     30               30                20
//    /       RR        /       LL       /  \
//   10       --->    20        -->     10   30
//     \              /
//      20          10
// LR --> This function receives the "center" node, in the example node 10 from the first tree
export const rotateLeftRight = <T extends {}>(node: NodeType<T> | null) => {
	if (node === null) throw new Error("Impossible to perform rotation LR with null node.");

	console.log(`Received node ${node.element} to rotate LR.`);

	rotateLeft(node.right!);
	rotateRight(node);
};

//    10                10                20
//      \     LL         \      RR       /  \
//      30    --->       20     -->     10   30
//     /                  \
//   20                   30
// RL --> This function receives the "center" node, in the example node 30 from the first tree
export const rotateRightLeft = <T extends {}>(node: NodeType<T> | null) => {
	if (node === null) throw new Error("Impossible to perform rotation RL with null node.");
	console.log(`Received node ${node.element} to rotate RL.`);

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
