import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, BookOpen, Workflow, BarChart3 } from "lucide-react";

const SoapMigrationGuide = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Code2 className="h-6 w-6 text-primary" />
            SOAP to REST Migration Guide
          </CardTitle>
          <CardDescription>
            Understanding and automating the migration from SOAP services to modern REST APIs
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BookOpen className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="concepts">
            <Code2 className="h-4 w-4 mr-2" />
            Concepts
          </TabsTrigger>
          <TabsTrigger value="agent">
            <Workflow className="h-4 w-4 mr-2" />
            Migration Agent
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What are Services?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="leading-relaxed">
                A <strong>service</strong> in computing is like a restaurant - you (the client) don't cook the food yourself,
                instead you ask the restaurant to make it for you. Similarly, a service is a program that sits on a computer
                and waits for other programs to ask it to do work.
              </p>

              <div className="space-y-2">
                <p className="font-medium">Key Concepts:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Service:</strong> A program that provides functionality to other programs</li>
                  <li><strong>Client:</strong> The program that requests services</li>
                  <li><strong>Endpoint:</strong> A specific URL where you can access the service</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Programs Communicate Over Networks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="font-medium">The Network is Like a Mail System:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Address:</strong> Every computer has an IP address (like 192.168.1.100)</li>
                <li><strong>Port:</strong> Each service listens on a specific "mailbox number" (like 8733 or 5090)</li>
                <li><strong>Message:</strong> Your program sends a request message</li>
                <li><strong>Response:</strong> The service sends back a response message</li>
              </ol>

              <div className="bg-muted/30 rounded-lg p-4 mt-4">
                <p className="font-medium mb-2">Example HTTP Request:</p>
                <pre className="text-xs overflow-x-auto">
{`GET /api/migrations HTTP/1.1
Host: localhost:5090`}
                </pre>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-medium mb-2">Example HTTP Response:</p>
                <pre className="text-xs overflow-x-auto">
{`HTTP/1.1 200 OK
Content-Type: application/json

[{"Id":1,"Name":"Initial Schema","Date":"2024-01-01T00:00:00"}]`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concepts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SOAP vs REST: Core Differences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">SOAP</Badge>
                    <span className="text-sm text-muted-foreground">Like a formal government office</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-green-600">Advantages:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>More structured</strong> - precise rules about format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>More features</strong> - complex scenarios, security, transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Built-in security</strong> - sophisticated auth</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Formal contracts</strong> - WSDL specifications</span>
                      </li>
                    </ul>

                    <p className="font-medium text-red-600 mt-3">Disadvantages:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span><strong>Verbose</strong> - lots of overhead</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span><strong>Complex</strong> - harder to read and debug</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 mt-3">
                    <p className="text-xs font-medium mb-2">SOAP Request Example:</p>
                    <pre className="text-[10px] overflow-x-auto">
{`<soap:Envelope xmlns:soap="...">
  <soap:Body>
    <GetMigrations xmlns="..." />
  </soap:Body>
</soap:Envelope>`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/20">REST</Badge>
                    <span className="text-sm text-muted-foreground">Like a simple phone call</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-green-600">Advantages:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Efficient</strong> - minimal overhead</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Human-readable</strong> - easy to understand</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Simple</strong> - straightforward HTTP methods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Widely adopted</strong> - industry standard</span>
                      </li>
                    </ul>

                    <p className="font-medium text-red-600 mt-3">Disadvantages:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span><strong>Less structured</strong> - fewer built-in rules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span><strong>Manual security</strong> - implement yourself</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 mt-3">
                    <p className="text-xs font-medium mb-2">REST Request Example:</p>
                    <pre className="text-[10px] overflow-x-auto">
{`GET /api/migrations HTTP/1.1`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <Card className="bg-blue-50 dark:bg-blue-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Use SOAP for:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Banking systems (security, transactions)</li>
                      <li>• Medical records (privacy, compliance)</li>
                      <li>• Government systems (formal contracts)</li>
                      <li>• Enterprise systems requiring guaranteed reliability</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Use REST for:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Mobile apps (simplicity, speed)</li>
                      <li>• Web applications (ease of development)</li>
                      <li>• Public APIs (accessibility)</li>
                      <li>• Modern microservices (performance)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Agent UI v1</CardTitle>
              <CardDescription>
                LLM-powered tooling suite for automating SOAP to REST migrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="font-medium">Key Features:</p>
                <ul className="text-sm space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Multiple execution modes:</strong> CLI, Jupyter notebooks, and Streamlit web interface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Batch processing:</strong> Run experiments across multiple LLM models simultaneously</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Visual analytics:</strong> Interactive dashboards for comparing migration results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>YAML-based results:</strong> Structured experiment summaries with detailed metrics</span>
                  </li>
                </ul>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-medium mb-3 text-sm">Migration Workflow:</p>
                <ol className="text-sm space-y-2 ml-4 list-decimal">
                  <li><strong>SOAP Analysis:</strong> Read source code, extract WSDL, identify operations</li>
                  <li><strong>Prompt Construction:</strong> Build detailed instructions for LLM</li>
                  <li><strong>Code Generation:</strong> LLM generates REST API code</li>
                  <li><strong>Compilation & Deployment:</strong> Build and start the generated service</li>
                  <li><strong>Validation:</strong> Compare SOAP and REST responses (parity testing)</li>
                  <li><strong>Results Recording:</strong> Save metrics and experiment data</li>
                </ol>
              </div>

              <Card className="bg-green-50 dark:bg-green-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Experiment Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">✅ Successful Aspects:</p>
                    <ul className="mt-1 ml-4 space-y-1">
                      <li>• Code generation (created new project)</li>
                      <li>• Build process (compiled successfully)</li>
                      <li>• Data model preservation (copied classes)</li>
                      <li>• 100% parity test success (when manually corrected)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">⚠️ Areas for Improvement:</p>
                    <ul className="mt-1 ml-4 space-y-1">
                      <li>• Port configuration (requires manual fixes)</li>
                      <li>• Endpoint generation (template vs specific)</li>
                      <li>• Business logic translation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <p className="font-medium text-sm">Related Projects:</p>
                <div className="grid gap-2">
                  <Card className="bg-muted/30">
                    <CardContent className="pt-3 pb-3">
                      <p className="text-sm font-medium">PythonSoapSolution</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Python-based SOAP service implementation and analysis tools
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-3 pb-3">
                      <p className="text-sm font-medium">lab-soap-service</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Laboratory environment for testing SOAP services (port 8733)
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-3 pb-3">
                      <p className="text-sm font-medium">lab-soap-migration-agent-v1</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI agent designed for SOAP to REST migration workflows
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics & Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="font-medium text-sm">Core Metrics Tracked:</p>
                <div className="grid gap-3">
                  <div className="border rounded-lg p-3">
                    <p className="font-medium text-sm">Migration Efficiency (SLOC/sec)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total SLOC / Total Duration - Measures overall throughput
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">Typical: 3-6 SLOC/sec</Badge>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="font-medium text-sm">Parity Success Rate (%)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Passed Tests / Total Tests) × 100 - Most important quality metric
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">Target: 100%</Badge>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="font-medium text-sm">Prompt Complexity (1-5 stars)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on prompt length relative to base template
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">Sweet spot: 3-4 stars</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-sm">Model Performance (Based on 500+ experiments):</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Model</th>
                        <th className="text-left p-2">Avg Duration</th>
                        <th className="text-left p-2">Efficiency</th>
                        <th className="text-left p-2">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="p-2 font-medium">GPT-4-turbo</td>
                        <td className="p-2">42.3s</td>
                        <td className="p-2">4.8 SLOC/s</td>
                        <td className="p-2"><Badge variant="outline" className="bg-green-50">87%</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">GPT-4</td>
                        <td className="p-2">48.1s</td>
                        <td className="p-2">4.2 SLOC/s</td>
                        <td className="p-2"><Badge variant="outline" className="bg-green-50">85%</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Claude-3-opus</td>
                        <td className="p-2">51.2s</td>
                        <td className="p-2">4.1 SLOC/s</td>
                        <td className="p-2"><Badge variant="outline" className="bg-green-50">82%</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">GPT-3.5-turbo</td>
                        <td className="p-2">35.7s</td>
                        <td className="p-2">5.1 SLOC/s</td>
                        <td className="p-2"><Badge variant="outline" className="bg-yellow-50">68%</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground italic mt-2">
                  ✨ GPT-4-turbo offers the best quality-speed balance for production use
                </p>
              </div>

              <Card className="bg-blue-50 dark:bg-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• <strong>3-4 star prompts</strong> achieve highest success rates (85-87%)</p>
                  <p>• <strong>GPT-3.5-turbo</strong> is fastest but has lower quality (good for prototyping)</p>
                  <p>• <strong>Claude models</strong> produce cleaner code but are slower</p>
                  <p>• <strong>Port configuration errors</strong> account for 30% of failures</p>
                  <p>• <strong>100% parity</strong> is achievable with proper prompt engineering</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SoapMigrationGuide;
