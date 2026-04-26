import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  ArrowRight,
  Search,
  Calendar,
  User,
  Tag,
  MessageCircle,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: number;
  image?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How AI is Revolutionizing Contract Review',
    excerpt: 'Discover how artificial intelligence is transforming the way law firms analyze and review contracts, reducing review time from hours to minutes.',
    content: 'AI-powered contract review is changing the legal industry. By leveraging machine learning and natural language processing, firms can now analyze contracts faster and more accurately than ever before. This technology identifies risks, extracts key terms, and flags potential issues automatically.',
    author: 'Sarah Johnson',
    date: '2026-04-20',
    category: 'AI & Technology',
    readTime: 5,
  },
  {
    id: '2',
    title: 'Best Practices for Due Diligence Automation',
    excerpt: 'Learn how to implement automated due diligence processes to improve efficiency and reduce errors in your legal operations.',
    content: 'Due diligence automation can significantly improve your firm\'s efficiency. By automating document review, compliance checking, and risk assessment, you can reduce the time spent on repetitive tasks and focus on strategic work. This guide covers implementation best practices and common pitfalls to avoid.',
    author: 'Michael Chen',
    date: '2026-04-18',
    category: 'Best Practices',
    readTime: 7,
  },
  {
    id: '3',
    title: 'Predicting Case Outcomes with Data Analytics',
    excerpt: 'Explore how predictive analytics can help law firms forecast case outcomes and develop better litigation strategies.',
    content: 'Predictive analytics is transforming litigation strategy. By analyzing historical case data, win rates, and settlement patterns, firms can make more informed decisions about case strategy and resource allocation. This article explores the tools and techniques used in predictive legal analytics.',
    author: 'Emma Davis',
    date: '2026-04-15',
    category: 'Analytics',
    readTime: 8,
  },
  {
    id: '4',
    title: 'Building Effective Legal Teams with AI Assistance',
    excerpt: 'Strategies for integrating AI tools into your law firm while maintaining the human expertise that clients value.',
    content: 'AI is not replacing lawyers—it\'s augmenting them. This article explores how to build effective teams that combine AI capabilities with human expertise. Learn how to structure your firm to maximize the benefits of legal technology while maintaining client relationships and quality work.',
    author: 'James Wilson',
    date: '2026-04-12',
    category: 'Team Management',
    readTime: 6,
  },
  {
    id: '5',
    title: 'Legal Tech Stack: Tools Every Modern Firm Needs',
    excerpt: 'A comprehensive guide to essential legal technology tools and how to integrate them into your practice.',
    content: 'Modern law firms need a robust tech stack. From document management to AI analysis, this guide covers the essential tools every firm should consider. Learn about integration strategies, implementation timelines, and ROI expectations.',
    author: 'Lisa Anderson',
    date: '2026-04-10',
    category: 'Technology',
    readTime: 9,
  },
  {
    id: '6',
    title: 'Compliance and Security in Legal Tech',
    excerpt: 'Understanding the compliance requirements and security considerations for implementing legal technology solutions.',
    content: 'Security and compliance are paramount in legal tech. This article covers GDPR, data protection regulations, and security best practices for law firms implementing AI and automation tools. Learn how to ensure your tech stack meets all regulatory requirements.',
    author: 'Robert Martinez',
    date: '2026-04-08',
    category: 'Compliance',
    readTime: 7,
  },
];

const resources = [
  {
    title: 'Legal OS Documentation',
    description: 'Complete guide to using Legal OS features and capabilities',
    icon: BookOpen,
    link: '#',
  },
  {
    title: 'API Reference',
    description: 'Developer documentation for integrating Legal OS with your systems',
    icon: MessageCircle,
    link: '#',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides for common tasks and workflows',
    icon: BookOpen,
    link: '#',
  },
  {
    title: 'Webinars & Events',
    description: 'Join our community for live webinars and training sessions',
    icon: Calendar,
    link: '#',
  },
];

export default function BlogResources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-card border-b border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Blog & Resources
          </h1>
          <p className="text-lg text-muted-foreground">
            Learn about AI in law, legal tech best practices, and how to transform your firm
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {filteredPosts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-accent">{post.category}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{post.readTime} min read</span>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-3 hover:text-accent transition-colors cursor-pointer">
                    {post.title}
                  </h2>

                  <p className="text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="text-accent hover:text-accent/80"
                      size="sm"
                    >
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No articles found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Resources & Documentation
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource, idx) => {
              const Icon = resource.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <Icon className="w-8 h-8 text-accent mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {resource.description}
                    </p>
                    <Button
                      variant="ghost"
                      className="text-accent hover:text-accent/80 p-0"
                      size="sm"
                    >
                      Explore <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-8 border border-accent/20">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Stay Updated
          </h2>
          <p className="text-muted-foreground mb-6">
            Get the latest articles and resources delivered to your inbox
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter your email"
              type="email"
              className="flex-1"
            />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
