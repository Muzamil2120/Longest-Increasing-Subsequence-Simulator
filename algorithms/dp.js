function LIS_DP(arr) {
  let n = arr.length;
  let dp = Array(n).fill(1);
  let parent = Array(n).fill(-1);

  let maxLen = 1, lastIndex = 0;

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[i] > arr[j] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        parent[i] = j;
      }
    }
    if (dp[i] > maxLen) {
      maxLen = dp[i];
      lastIndex = i;
    }
  }

  let lis = [];
  while (lastIndex !== -1) {
    lis.push(arr[lastIndex]);
    lastIndex = parent[lastIndex];
  }

  return lis.reverse();
}
