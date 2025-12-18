function LIS_Optimized(arr) {
  let tails = [];
  let prev = Array(arr.length).fill(-1);
  let pos = [];

  for (let i = 0; i < arr.length; i++) {
    let left = 0, right = tails.length;

    while (left < right) {
      let mid = Math.floor((left + right) / 2);
      if (tails[mid] < arr[i]) left = mid + 1;
      else right = mid;
    }

    tails[left] = arr[i];
    pos[left] = i;

    if (left > 0) prev[i] = pos[left - 1];
  }

  let k = pos[tails.length - 1];
  let lis = [];

  while (k !== -1) {
    lis.push(arr[k]);
    k = prev[k];
  }

  return lis.reverse();
}
