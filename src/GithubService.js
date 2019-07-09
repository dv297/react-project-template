import axios from 'axios';

const getParsedProjectInfo = (pullRequestUrl) => {
  let [baseUrl, projectPath] = pullRequestUrl.split('.com');
  const [_, owner, project, _1, pullRequestNumber] = projectPath.split('/');
  baseUrl += '.com';

  return {
    baseUrl,
    owner,
    project,
    pullRequestNumber,
  };
};

const GithubService = {
  getPullRequestData: (pullRequestUrl) => {
    return new Promise((resolve, reject) => {
      if (!pullRequestUrl) {
        reject('Pull Request URL not provided');
      }
      const { baseUrl, owner, project, pullRequestNumber } = getParsedProjectInfo(pullRequestUrl);

      const apiRoute = `${baseUrl}/api/v3/repos/${owner}/${project}/pulls/${pullRequestNumber}/files`;
      axios
        .get(apiRoute)
        .then((result) => result.data)
        .then((data) => {
          const snapshotRegex = /__snapshots__/g;
          const wdioRegex = /wdio/g;
          const wdioEntries = data.filter(({ filename }) => filename.match(snapshotRegex) && filename.match(wdioRegex));
          resolve(wdioEntries);
        });
    });
  },
  getMasterBranchData: (pullRequestUrl, filename) => {
    return new Promise((resolve, reject) => {
      if (!pullRequestUrl || !filename) {
        reject('Pull Request URL not provided');
      }

      const { baseUrl, owner, project } = getParsedProjectInfo(pullRequestUrl);

      const apiRoute = `${baseUrl}/api/v3/repos/${owner}/${project}/contents/${filename}`;
      resolve(axios.get(apiRoute).then((result) => result.data));
    });
  },
  downloadImage: (imageUrl) => {
    return axios.get(imageUrl, { responseType: 'stream' });
  },
};

export default GithubService;
