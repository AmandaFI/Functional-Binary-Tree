import { checkAncestorsBalance } from "./AVLTreeBalanceMethods";
import {
	addNode,
	deleteLeafNode,
	deleteNodeWithBothChildren,
	deleteNodeWithOnlyChild,
	searchNode,
} from "./binarySearchTreeOperations";
import { filterTree, forEachElement, mapTree, reduceTree, traverseTree } from "./binaryTreeIterationMethods";
import {
	createNode,
	defineCompareFn,
	displayTreeInline,
	displayTreePyramid,
	hasBothChildren,
	isLeaf,
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
		checkAncestorsBalance(addedNode);
	};

	const deleteNode = (element: T, node: NodeType<T> | null, root: NodeType<T>, compareFn: CompareFnType<T>): boolean => {
		if (!node) return false;
		if (element === root.element && isLeaf(root)) throw new Error("Root deletion not allowed.");

		if (node.element === element) {
			if (isLeaf(node)) {
				const deletedNodeParent = deleteLeafNode(element, node.parent);
				checkAncestorsBalance(deletedNodeParent);
			} else if (hasBothChildren(node)) {
				deleteNodeWithBothChildren(node, node.parent, root, compareFn);
				// checkAncestorsBalance(node.parent!);
			} else {
				const removedNodeChild = deleteNodeWithOnlyChild(node, node.parent, root);
				checkAncestorsBalance(removedNodeChild);
			}
			return true;
		}
		if (compareFn!(element, node.element) === -1) return deleteNode(element, node.left, root, compareFn);
		else if (compareFn!(element, node.element) === 1) return deleteNode(element, node.right, root, compareFn);
		return false;
	};

	const remove = (element: T) => deleteNode(element, root, root, compareFn!);
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

const tree = AVLTree(20);
tree.add(10);
// tree.pyramid(tree.root);
tree.add(40);
tree.add(5);
tree.add(15);
tree.add(50);
tree.add(12);
tree.add(18);
tree.pyramid(tree.root);

tree.remove(40);

tree.pyramid(tree.root);
