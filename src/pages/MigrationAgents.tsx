import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, BarChart3, Wrench, Users, Settings, Code, TestTube, Zap, GitBranch } from "lucide-react";

const MigrationAgents = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Migration Agent UI v1
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-6">
            Comprehensive LLM-powered tooling suite for automating SOAP-to-REST migrations with multiple execution modes, batch processing, and visual analytics.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-sm">Streamlit Web Interface</Badge>
            <Badge variant="secondary" className="text-sm">Multi-Agent System</Badge>
            <Badge variant="secondary" className="text-sm">Batch Experiments</Badge>
            <Badge variant="secondary" className="text-sm">Results Analytics</Badge>
            <Badge variant="secondary" className="text-sm">SOAP Generator</Badge>
          </div>
        </div>

        {/* Overview Card */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Platform Overview
            </CardTitle>
            <CardDescription>
              The Migration Agent UI v1 provides multiple interfaces for running migrations and analyzing results, suitable for both interactive experimentation and batch processing at scale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-primary">Key Features</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Multiple execution modes: CLI, Jupyter notebooks, Streamlit web UI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Batch processing across multiple LLM models simultaneously</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Interactive dashboards for comparing migration results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>YAML-based structured experiment summaries with detailed metrics</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-purple-600">Primary Use Cases</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">1.</span>
                    <span><strong>Single migrations:</strong> Test and refine strategies interactively</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">2.</span>
                    <span><strong>Batch experiments:</strong> Compare LLM models and prompts at scale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">3.</span>
                    <span><strong>Results analysis:</strong> Visualize trends, success rates, performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">4.</span>
                    <span><strong>SOAP generation:</strong> Create test services for validation</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Tabs */}
        <Tabs defaultValue="run-experiments" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
            <TabsTrigger value="run-experiments" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Run Experiments</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Results Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="soap-gen" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">SOAP Generator</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Batch Runs</span>
            </TabsTrigger>
            <TabsTrigger value="multi-agent" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Multi-Agent</span>
            </TabsTrigger>
          </TabsList>

          {/* Run Experiments Tab */}
          <TabsContent value="run-experiments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  Run Experiments
                </CardTitle>
                <CardDescription>
                  Execute single migration experiments with two distinct agent approaches: Classic (one-shot) and Advanced (multi-stage pipeline)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Classic Agent</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Original one-shot migration flow with manual prompt controls
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Single LLM call to generate REST code from SOAP</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Editable base prompt with custom requirements</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Fast iteration for prompt engineering</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Outputs to standard directories</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/20">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Advanced Agent</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Multi-stage pipeline with automated parity checks
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="text-purple-500">•</span>
                        <span>6-phase workflow: Setup → Context → Generate → Build → Validate → Record</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Automatic build repair attempts</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Comprehensive SOAP vs REST parity validation</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Separate output directories (no collision with classic)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Key Features</h4>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Settings className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">SOAP Service Selector</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Browse and select from previously generated SOAP services, organized by complexity level</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Prompt Controls</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Edit base prompt, add custom requirements, and append runtime instructions</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TestTube className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Live Parity Tests</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Real-time parity test results showing SOAP vs REST response comparisons</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Wrench className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Maintenance Tools</span>
                      </div>
                      <p className="text-xs text-muted-foreground">One-click cleanup to kill lingering services on ports 8734 (SOAP) and 5090 (REST)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Migration Workflow</h5>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline">1. Select SOAP Service</Badge>
                    <span>→</span>
                    <Badge variant="outline">2. Choose Model</Badge>
                    <span>→</span>
                    <Badge variant="outline">3. Configure Prompts</Badge>
                    <span>→</span>
                    <Badge variant="outline">4. Run Migration</Badge>
                    <span>→</span>
                    <Badge variant="outline">5. Review Parity Tests</Badge>
                    <span>→</span>
                    <Badge variant="outline">6. Analyze Results</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Analysis Tab */}
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Migration Results & Analytics
                </CardTitle>
                <CardDescription>
                  Interactive dashboards for exploring experiment results, comparing models, and analyzing migration success trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Data Sources</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Loads YAML results from both Classic and Advanced agent runs</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Auto-refreshes when new experiment files are detected</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Supports hierarchical batch result directories</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Filtering Options</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Agent Type:</strong> Classic vs Advanced</li>
                      <li><strong>Models:</strong> Multi-select across GPT-4, GPT-3.5, Claude variants</li>
                      <li><strong>Batch Groups:</strong> Filter by subdirectory structure</li>
                      <li><strong>Date Range:</strong> Custom time window selection</li>
                      <li><strong>Text Search:</strong> Include/exclude substring matching</li>
                      <li><strong>Success Stages:</strong> Filter by code gen, build, run, test success</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Visualizations</h4>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Success Funnel</h5>
                      <p className="text-xs text-muted-foreground">
                        Visualize drop-off rates across pipeline stages: Code Generated → Build Success → Run Success → Test Success
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Per-Model Funnels</h5>
                      <p className="text-xs text-muted-foreground">
                        Compare success rates across different LLM models side-by-side with configurable grid layout
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Metric Distributions</h5>
                      <p className="text-xs text-muted-foreground">
                        Box plots and histograms for migration efficiency, complexity, compliance, and regression metrics
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Model Comparison</h5>
                      <p className="text-xs text-muted-foreground">
                        Bar charts showing average performance across models for selected metrics
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Time Trends</h5>
                      <p className="text-xs text-muted-foreground">
                        Line charts tracking metric evolution over time with per-model color coding
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Detailed View</h5>
                      <p className="text-xs text-muted-foreground">
                        Drill down into individual experiments with full YAML inspection and metric breakdown
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Key Metrics Tracked</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <Badge variant="secondary">Migration Efficiency (SLOC/sec)</Badge>
                    <Badge variant="secondary">Code Complexity (1-5 stars)</Badge>
                    <Badge variant="secondary">Coding Compliance (1-5 stars)</Badge>
                    <Badge variant="secondary">Design Compliance (1-5 stars)</Badge>
                    <Badge variant="secondary">Regression (%)</Badge>
                    <Badge variant="secondary">Solution Size (SLOC)</Badge>
                    <Badge variant="secondary">Prompt Complexity (1-5 stars)</Badge>
                    <Badge variant="secondary">Parity Success Rate (%)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOAP Generator Tab */}
          <TabsContent value="soap-gen" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  SOAP Service Generator
                </CardTitle>
                <CardDescription>
                  Generate SOAP services at 6 different complexity levels using LLMs for testing migration workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                    <h4 className="font-semibold mb-3">Complexity Levels</h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="text-sm">
                        <div className="font-semibold text-orange-700 dark:text-orange-300">Level 1: Simple Data Access</div>
                        <p className="text-xs text-muted-foreground">Basic SOAP service with simple data structures and getter methods. No database, no external dependencies.</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-orange-700 dark:text-orange-300">Level 2: Database Access</div>
                        <p className="text-xs text-muted-foreground">CRUD operations with database context. Includes Entity Framework and connection string configuration.</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-orange-700 dark:text-orange-300">Level 3: Conditions & Loops</div>
                        <p className="text-xs text-muted-foreground">Business logic with conditionals and iterations. Data filtering, transformation, and validation.</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-orange-700 dark:text-orange-300">Level 4: Recursion</div>
                        <p className="text-xs text-muted-foreground">Recursive algorithms for hierarchical data. Tree/graph traversal with base and recursive cases.</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-orange-700 dark:text-orange-300">Level 5: DI & Inheritance</div>
                        <p className="text-xs text-muted-foreground">Dependency injection patterns and OOP principles. Service abstractions with proper IoC registration.</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-orange-700 dark:text-orange-300">Level 6: Introspection</div>
                        <p className="text-xs text-muted-foreground">Reflection and runtime type analysis. Dynamic method invocation and metadata-driven operations.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Generation Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Model selection from all available GPT variants (GPT-4, GPT-5, Codex, etc.)</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Configurable token limits with model-specific recommendations</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Automatic code sanitization and namespace fixes</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Build validation with dotnet compile check</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Smoke test to verify service startup</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Service Registry</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Tracks all generated services with metadata (model, timestamp, level)</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Browse existing services organized by complexity level</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>One-click copy of service paths for migration workflows</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Validation status indicators for each service</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Generated Project Structure</h5>
                  <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <div className="font-semibold mb-1">Files Created:</div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Program.cs (CoreWCF config)</li>
                        <li>• Services/{'{ServiceName}'}.cs</li>
                        <li>• Models/{'{Domain}'}.cs</li>
                        <li>• {'{ServiceName}'}.csproj</li>
                        <li>• appsettings.json</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Additional Files:</div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Web.config (legacy compat)</li>
                        <li>• Dockerfile (multi-stage)</li>
                        <li>• docker-compose.yml</li>
                        <li>• test-request.xml (SOAP 1.1)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Experiments Tab */}
          <TabsContent value="batch" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-purple-500" />
                  Batch Experiments
                </CardTitle>
                <CardDescription>
                  Run multiple experiments per model to compare LLM performance and prompt variations at scale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/20">
                    <h4 className="font-semibold mb-3">Batch Configuration</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Multi-Model Selection:</strong> Choose multiple models to test simultaneously</li>
                      <li><strong>Experiments per Model:</strong> Configure 1-50 runs per model (typically 10)</li>
                      <li><strong>Project Prefix:</strong> Name template for generated projects</li>
                      <li><strong>Base Prompt Editing:</strong> Customize the migration prompt shared across all runs</li>
                      <li><strong>Runtime Instructions:</strong> Add global instructions applied to all experiments</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4 bg-indigo-50 dark:bg-indigo-950/20">
                    <h4 className="font-semibold mb-3">Organization & Output</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Results Subdirectory:</strong> Auto-generated timestamp-based folders</li>
                      <li><strong>Group by Model:</strong> Optional per-model result organization</li>
                      <li><strong>Sequential Execution:</strong> Models run one after another to avoid port conflicts</li>
                      <li><strong>Progress Tracking:</strong> Dual progress bars (overall + per-model)</li>
                      <li><strong>Live Logs:</strong> Real-time status updates during batch execution</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Batch Workflow</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <div className="font-medium text-sm">Select Models & Parameters</div>
                        <p className="text-xs text-muted-foreground">Choose 2+ models (e.g., GPT-4, GPT-3.5, Claude-3) and set experiments per model</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <div className="font-medium text-sm">Configure Shared Settings</div>
                        <p className="text-xs text-muted-foreground">Edit base prompt, add custom requirements, set runtime instructions</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <div className="font-medium text-sm">Set Organization Mode</div>
                        <p className="text-xs text-muted-foreground">Choose flat structure or group results by model subdirectories</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Badge className="mt-1">4</Badge>
                      <div>
                        <div className="font-medium text-sm">Execute Batch</div>
                        <p className="text-xs text-muted-foreground">Watch live progress as each model processes N experiments sequentially</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Badge className="mt-1">5</Badge>
                      <div>
                        <div className="font-medium text-sm">Analyze Results</div>
                        <p className="text-xs text-muted-foreground">Navigate to Results Analysis page to compare model performance</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Example Batch Structure</h5>
                  <div className="font-mono text-xs space-y-1 text-muted-foreground">
                    <div>experiment_results_yaml/</div>
                    <div className="ml-4">└── batch_20241015_1430/</div>
                    <div className="ml-8">├── gpt4/</div>
                    <div className="ml-12">│   ├── exp_401_gpt4.yaml</div>
                    <div className="ml-12">│   ├── exp_402_gpt4.yaml</div>
                    <div className="ml-12">│   └── ...</div>
                    <div className="ml-8">├── gpt35/</div>
                    <div className="ml-12">│   ├── exp_411_gpt35.yaml</div>
                    <div className="ml-12">│   └── ...</div>
                    <div className="ml-8">└── claude3_opus/</div>
                    <div className="ml-12">    └── exp_421_claude3.yaml</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multi-Agent Tab */}
          <TabsContent value="multi-agent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-500" />
                  GPT Multi-Agent Migration
                </CardTitle>
                <CardDescription>
                  Advanced multi-agent system with 6 specialized agents coordinating to perform comprehensive SOAP-to-REST migrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                    <h4 className="font-semibold mb-3">The 6-Agent System</h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="text-sm">
                        <div className="font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs">1</span>
                          Orchestrator
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Coordinates the entire migration workflow and delegates tasks to specialized agents</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                          Analyst
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Analyzes SOAP service structure, contracts, and dependencies</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">3</span>
                          Modeler
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Designs REST API models and endpoint structure from SOAP definitions</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">4</span>
                          Coder
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Generates REST API implementation code following best practices</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">5</span>
                          Builder
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Compiles the generated code and fixes build errors</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs">6</span>
                          Tester
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Validates functional equivalence between SOAP and REST services</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Configuration</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Model Selection:</strong> Choose GPT model to power all agents</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Project ID:</strong> Unique identifier for this migration run</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>SOAP Service Picker:</strong> Select from generated services or custom path</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>REST Output Directory:</strong> Auto-updates based on project ID</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Wait Option:</strong> Poll until completion or run async</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Real-Time Monitoring</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Agent Status Indicators:</strong> Live status for each of 6 agents (Idle, Ready, Working, Done, Error)</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Log Streaming:</strong> Real-time output from CLI subprocess</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Progress Tracking:</strong> Visual progress bar based on agent activity</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Migration Stage:</strong> Current phase displayed in status message</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Log Download:</strong> Download full migration log file on completion</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Migration Pipeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20">
                      <span className="font-bold text-teal-600">→</span>
                      <div>
                        <span className="font-semibold">Orchestrator initializes</span> and creates migration plan
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <span className="font-bold text-blue-600">→</span>
                      <div>
                        <span className="font-semibold">Analyst examines</span> SOAP contracts, data models, and operations
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                      <span className="font-bold text-purple-600">→</span>
                      <div>
                        <span className="font-semibold">Modeler designs</span> REST API structure and endpoint mappings
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                      <span className="font-bold text-orange-600">→</span>
                      <div>
                        <span className="font-semibold">Coder generates</span> ASP.NET Core REST implementation
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                      <span className="font-bold text-green-600">→</span>
                      <div>
                        <span className="font-semibold">Builder compiles</span> and iteratively fixes build errors
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20">
                      <span className="font-bold text-pink-600">→</span>
                      <div>
                        <span className="font-semibold">Tester validates</span> parity between SOAP and REST responses
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Output Artifacts</h5>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium mb-1">Generated Project:</div>
                      <code className="text-muted-foreground">gpt_multi_agent_migration/generated_projects/{'{project_id}'}_rest/</code>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Per-Migration Log:</div>
                      <code className="text-muted-foreground">logs/migration_{'{project_id}'}_{'{timestamp}'}.log</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Getting Started Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Quick setup guide for the Migration Agent UI v1</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge>1</Badge>
                  Install Dependencies
                </h4>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                  cd migration_agent_UI_v1<br/>
                  pip install -r shared_config/requirements.txt<br/>
                  pip install -r st_app/requirements.txt
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge>2</Badge>
                  Configure Environment
                </h4>
                <p className="text-sm text-muted-foreground mb-2">Create a <code>.env</code> file in the project root:</p>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                  OPENAI_API_KEY=your_api_key_here<br/>
                  SOAP_REPO_PATH=C:\path\to\soap\service<br/>
                  REST_PORT=5090
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge>3</Badge>
                  Launch Streamlit App
                </h4>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                  streamlit run st_app/Home.py
                </div>
                <p className="text-sm text-muted-foreground mt-2">Opens browser at <code>http://localhost:8501</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MigrationAgents;
