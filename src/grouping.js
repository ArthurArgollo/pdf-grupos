export function isPdf(file) {
  return file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
}

export function getUngrouped(files, groups) {
  return files.filter((file) => !groups.some((group) => group.files.includes(file.id)));
}

export function addFileToGroup(groups, fileId, groupId) {
  return groups.map((group) => group.id === groupId
    ? { ...group, files: [...group.files.filter((id) => id !== fileId), fileId] }
    : { ...group, files: group.files.filter((id) => id !== fileId) });
}

export function removeFileFromGroups(groups, fileId) {
  return groups.map((group) => ({ ...group, files: group.files.filter((id) => id !== fileId) }));
}

export function moveFile(groups, groupId, index, direction) {
  return groups.map((group) => {
    if (group.id !== groupId) return group;
    const files = [...group.files];
    const target = index + direction;
    if (target < 0 || target >= files.length) return group;
    [files[index], files[target]] = [files[target], files[index]];
    return { ...group, files };
  });
}

export function downloadName(name) {
  const safe = String(name || '').trim().replace(/[^\w\d-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return `${safe || 'grupo'}.pdf`;
}
