// https://en.wikipedia.org/wiki/AVL_tree
// https://www.enjoyalgorithms.com/blog/avl-tree-data-structure

import { createNode, editNode, editNodePosition, treeHeight } from "./binaryTreePrimitiveMethods";
import { NodeType, RotationType } from "./binaryTreeTypes";

export const calculateBalanceFactor = <T extends {}>(node: NodeType<T> | null) => {
	if (!node) return 0;
	return treeHeight(node.right) - treeHeight(node.left);
};

export const isBalanced = <T extends {}>(node: NodeType<T> | null) => {
	const balanceFactor = calculateBalanceFactor(node);
	if (balanceFactor === -1 || balanceFactor === 0 || balanceFactor === 1) return true;
	return false;
};

export const choseRotation = <T extends {}>(node: NodeType<T>): RotationType => {
	const balanceFactor = calculateBalanceFactor(node);
	if (node.parentSide === "right") {
		if (balanceFactor >= 0) return "RR";
		return "RL";
	} else {
		if (balanceFactor <= 0) return "LL";
		return "LR";
	}
};

export const checkAncestorsBalance = <T extends {}>(node: NodeType<T>) => {
	while (node.parent !== null) {
		if (!isBalanced(node.parent)) {
			console.log(`Node ${node.parent.element} needs balance`);
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
export const rotateRight = <T extends {}>({ element, parent, left: leftChild, levelPosition }: NodeType<T>) => {
	if (!parent) throw new Error("Impossible to execute LL rotation.");
	const rightChild = createNode(parent.element, parent, "right");
	editNode(parent, element, leftChild, rightChild);

	if (leftChild) {
		leftChild.parent = parent;
		editNodePosition(leftChild, leftChild.level - 1, levelPosition);
	}
};

//       10                       20
//        \                      /  \
//         20      --->        10    30
//          \
//           30
// RR   --> This function receives the "center" node, in the example node 20
export const rotateLeft = <T extends {}>({ element, parent, right: rightChild, levelPosition }: NodeType<T>) => {
	if (!parent) throw new Error("Impossible to execute RR rotation.");
	const leftChild = createNode(parent.element, parent, "left");
	editNode(parent, element, leftChild, rightChild);

	if (rightChild) {
		rightChild.parent = parent;
		editNodePosition(rightChild, rightChild.level - 1, levelPosition);
	}
};
//     30               30                20
//    /       RR        /       LL       /  \
//   10       --->    20        -->     10   30
//     \              /
//      20          10
// LR --> This function receives the "center" node, in the example node 10 from the first tree
export const rotateLeftRight = <T extends {}>(node: NodeType<T>) => {
	rotateLeft(node.right!);
	rotateRight(node);
};

//    10                10                20
//      \     LL         \      RR       /  \
//      30    --->       20     -->     10   30
//     /                  \
//   20                   30
// RL --> This function receives the "center" node, in the example node 30 from the first tree
export const rotateRightLeft = <T extends {}>(node: NodeType<T>) => {
	rotateRight(node.left!);
	rotateLeft(node);
};

export const balance = <T extends {}>(node: NodeType<T>) => {
	const rotation = choseRotation(node);
	console.log(`Executing ${rotation} rotation...`);
	switch (rotation) {
		case "LL":
			rotateRight(node);
			break;
		case "RL":
			rotateRightLeft(node);
			break;
		case "RR":
			rotateLeft(node);
			break;
		case "LR":
			rotateLeftRight(node);
			break;
		default:
			throw new Error("Unknown rotation type.");
	}
};
