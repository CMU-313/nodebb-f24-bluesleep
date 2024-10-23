console.log("Starting Iroh Analysis...");

module.exports = {
    entry: 'app.js',
    output: './iroh-output',
    analyze: {
      calls: true,
      variables: true,
      ifStatements: true,
    },
    include: ['./src/**/*.js'],
    exclude: ['./node_modules'],
    verbose: true
  };
  
  console.log("Iroh Configuration Loaded");