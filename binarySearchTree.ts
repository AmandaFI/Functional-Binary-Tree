// print
// encontrar a maior arvore balanceada 'dentro' da arvore
// using cached inOrderTraverse result
// FAZER TESTES DE TUDO
// arrumar reduce

import {
	defineCompareFn,
	leftMostElement,
	rightMostElement,
	displayTreeInline,
	displayTreePyramid,
	treeHeight,
	createNode,
	elementsSmallerThan,
	elementsGreaterThan,
	elementsBetween,
	elementsSmallerThanOrEqualTo,
	elementsGreaterThanOrEqualTo
} from "./binaryTreePrimitiveMethods";
import { CompareFnType, FilterFnType, ForEachFnType, MapFnType, NodeType, OrderType, ReduceFnType } from "./binaryTreeTypes";
import { filterTree, forEachElement, mapTree, reduceTree, traverseTree, visitElements } from "./binaryTreeIterationMethods";
import { addNode, deleteNode, searchNode } from "./binarySearchTreeOperations";

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

	const add = (element: T) => addNode(element, root, compareFn!);
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
	const smallerThan = (element: T) => elementsSmallerThan(element, root, compareFn!);
	const smallerThanOrEqualTo = (element: T) => elementsSmallerThanOrEqualTo(element, root, compareFn!)
	const greaterThan = (element: T) => elementsGreaterThan(element, root, compareFn!)
	const greaterThanOrEqualTo = (element: T) => elementsGreaterThanOrEqualTo(element, root, compareFn!)
	// between inclusion variations on binaryTreePrimitiveMethods
	const between = (leftElement: T, rightElement: T, leftInclusive = false, rightInclusive = false) => elementsBetween(leftElement, rightElement, root, compareFn!, {leftInclusive, rightInclusive})
	const pyramidDisplay = () => displayTreePyramid(root);

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
		pyramidDisplpay: pyramidDisplay,
		smallerThan,
		greaterThan,
		between,
		smallerThanOrEqualTo,
		greaterThanOrEqualTo
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
tree.add(4);
tree.add(3);
tree.add(9);
tree.add(8);
tree.add(13);
tree.add(18);

// // let b = tree.inorderPredecessor(tree.root.left!.right!);
// // console.log(b ? b.element : "no");
// tree.remove(6);
// tree.pyramidDisplpay();

// tree.add(2);
// tree.add(1);
// tree.add(8);

// // let a = tree.lowestCommonAncestor(1, 23);
// // const a = tree.lowestCommonAncestor(4, 6);
// // const a = tree.lowestCommonAncestor(3, 4);
// // const a = tree.lowestCommonAncestor(2, 4);
// // const a = tree.lowestCommonAncestor(3, 189);

// // console.log(a ? a.element : "no");

tree.pyramidDisplpay();

console.log(tree.smallerThan(6))
console.log(tree.smallerThanOrEqualTo(6))

console.log(tree.greaterThan(6))
console.log(tree.greaterThanOrEqualTo(6))

console.log(tree.between(4, 13))
console.log(tree.between(4, 13, true, true))



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
// console.log(tree.traverse());
