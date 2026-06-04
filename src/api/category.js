import request from './request';

export function getCategoryTree() {
  return request.get('/categories');
}

export function createCategory(data) {
  return request.post('/categories', data);
}

export function deleteCategory(categoryId) {
  return request.delete(`/categories/${categoryId}`);
}

/** 将分类树转为 Cascader 选项 */
export function toCascaderOptions(tree) {
  if (!Array.isArray(tree)) return [];
  return tree.map((node) => ({
    value: node.id,
    label: node.name,
    children: node.children?.length ? toCascaderOptions(node.children) : undefined,
  }));
}

/** 根据 categoryId 在树中查找级联路径，如 [1, 3] */
export function findCategoryPath(tree, targetId, path = []) {
  if (!Array.isArray(tree)) return null;
  for (const node of tree) {
    const nextPath = [...path, node.id];
    if (node.id === targetId) return nextPath;
    if (node.children?.length) {
      const found = findCategoryPath(node.children, targetId, nextPath);
      if (found) return found;
    }
  }
  return null;
}
