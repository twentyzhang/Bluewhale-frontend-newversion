import request from './request';

export function getCategoryTree() {
  return request.get('/categories');
}

/** 将分类树展平为 Select 选项（含层级路径） */
export function flattenCategoryOptions(tree, prefix = '') {
  if (!Array.isArray(tree)) return [];
  const options = [];
  for (const node of tree) {
    const label = prefix ? `${prefix} / ${node.name}` : node.name;
    options.push({ value: node.id, label });
    if (node.children?.length) {
      options.push(...flattenCategoryOptions(node.children, label));
    }
  }
  return options;
}
