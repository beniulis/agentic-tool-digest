import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Code, Server, Database, ArrowRight, Globe, Shield, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            SOAP to REST Migration Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understanding service architectures, their differences, and automated migration strategies for modern development
          </p>
        </div>

        {/* What are Services Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              What are Services?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              A <strong>service</strong> in computing is like a restaurant - you (the client) don't cook the food yourself, 
              instead you ask the restaurant to make it for you. Similarly, a service is a program that sits on a computer 
              and waits for other programs to ask it to do work.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 border rounded-lg">
                <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Service</h4>
                <p className="text-sm text-muted-foreground">A program that provides functionality to other programs</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Code className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Client</h4>
                <p className="text-sm text-muted-foreground">The program that requests services</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <ArrowRight className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Endpoint</h4>
                <p className="text-sm text-muted-foreground">A specific URL where you can access the service</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SOAP vs REST Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* SOAP Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-500" />
                SOAP (Simple Object Access Protocol)
                <Badge variant="secondary">Structured</Badge>
              </CardTitle>
              <p className="text-muted-foreground">Like a formal government office with strict procedures</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">More structured - precise rules about format</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Built-in security and transactions</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Formal contracts (WSDL files)</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Verbose - lots of overhead</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Complex - harder to debug</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Best for:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Banking systems</li>
                  <li>• Medical records</li>
                  <li>• Government systems</li>
                  <li>• Enterprise systems</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* REST Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-green-500" />
                REST (REpresentational State Transfer)
                <Badge variant="secondary">Simple</Badge>
              </CardTitle>
              <p className="text-muted-foreground">Like a simple, direct phone call</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Efficient - minimal overhead</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Human-readable and easy to debug</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Simple HTTP methods (GET, POST, PUT, DELETE)</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Less structured - fewer built-in features</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Manual security implementation</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Best for:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mobile applications</li>
                  <li>• Web applications</li>
                  <li>• Public APIs</li>
                  <li>• Modern microservices</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-World Example */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Real-World Example: Migration Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our lab service tracks database schema changes over time, like a change log for database structure.
            </p>
            
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h5 className="font-semibold mb-2">Data Model: Migration Class</h5>
              <pre className="text-sm overflow-x-auto">
{`[DataContract]
public class Migration
{
    [DataMember]
    public int Id { get; set; }           // Sequence number
    
    [DataMember] 
    public required string Name { get; set; }  // What changed
    
    [DataMember]
    public DateTime Date { get; set; }    // When it happened
}`}
              </pre>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 border rounded">
                <h6 className="font-semibold text-sm">Initial Schema</h6>
                <p className="text-xs text-muted-foreground">Basic database structure</p>
              </div>
              <div className="p-3 border rounded">
                <h6 className="font-semibold text-sm">Add Users Table</h6>
                <p className="text-xs text-muted-foreground">New functionality</p>
              </div>
              <div className="p-3 border rounded">
                <h6 className="font-semibold text-sm">Add Indexes</h6>
                <p className="text-xs text-muted-foreground">Performance optimization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migration Agent Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Migration Agent Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-3 text-green-600">✅ Successful Aspects</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Code generation (created new project)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Build process (compiled successfully)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Data model preservation (copied Migration class)
                  </li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold mb-3 text-red-600">❌ Failed Aspects</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Port configuration (used wrong port)
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Endpoint creation (generated wrong endpoints)
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Business logic translation
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Verification Results</h5>
              <p className="text-sm text-green-700 dark:text-green-400">
                When manually corrected, the system achieved <strong>✅ 100% parity test success</strong> (5/5 SOAP-to-REST comparisons passed).
                This confirmed that the agent infrastructure works correctly - the issue was in the LLM's instruction following.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Takeaways */}
        <Card>
          <CardHeader>
            <CardTitle>Key Takeaways</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h6 className="font-semibold mb-1">Protocol Choice</h6>
                  <p className="text-sm text-muted-foreground">REST is simpler for most use cases, SOAP provides more features for complex enterprise scenarios</p>
                </div>
                <div>
                  <h6 className="font-semibold mb-1">Migration Complexity</h6>
                  <p className="text-sm text-muted-foreground">Converting between protocols requires preserving functionality, security, and performance</p>
                </div>
                <div>
                  <h6 className="font-semibold mb-1">Industry Trends</h6>
                  <p className="text-sm text-muted-foreground">90%+ of new projects use REST due to simplicity and performance</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h6 className="font-semibold mb-1">Migration Tools</h6>
                  <p className="text-sm text-muted-foreground">Automated migration is challenging but valuable for large enterprise systems</p>
                </div>
                <div>
                  <h6 className="font-semibold mb-1">Testing Approach</h6>
                  <p className="text-sm text-muted-foreground">Having both versions enables verification that migrations produce identical results</p>
                </div>
                <div>
                  <h6 className="font-semibold mb-1">Libraries Used</h6>
                  <p className="text-sm text-muted-foreground">CoreWCF.Http for SOAP, Microsoft.AspNetCore.OpenApi for REST</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-muted/20 py-12 mt-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">AT</span>
              </div>
              <span className="font-semibold">AgenticTools</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Curated collection of agentic coding tools for modern developers
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Updated daily</span>
              <span>•</span>
              <span>Community driven</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;