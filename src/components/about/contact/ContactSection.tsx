/**
 * @fileoverview Contact Section Component
 * @module components/about/contact/ContactSection
 * @governance EPIC-29-8
 *
 * Contact section with email, LinkedIn, GitHub, and availability status.
 *
 * Story 29.8: Contact Section Implementation
 */

import { useTranslation } from 'react-i18next';
import { Mail, Linkedin, Github, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContactSectionProps {
  /**
   * Email address
   */
  email?: string;

  /**
   * LinkedIn URL
   */
  linkedinUrl?: string;

  /**
   * GitHub URL
   */
  githubUrl?: string;

  /**
   * Location
   */
  location?: string;

  /**
   * Timezone
   */
  timezone?: string;

  /**
   * Availability status
   */
  available?: boolean;
}

export function ContactSection({
  email = 'contact@via-gent.dev',
  linkedinUrl = 'https://linkedin.com/in/viagent',
  githubUrl = 'https://github.com/viagent',
  location = 'Ho Chi Minh City, Vietnam',
  timezone = 'UTC+7',
  available = true,
}: ContactSectionProps) {
  return (
    <section className="contact-section bg-background py-12 md:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Get in Touch
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Open to opportunities and collaborations
          </p>
        </div>

        {/* Availability Status */}
        <div className="flex justify-center mb-8">
          <div className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full border',
            available
              ? 'border-success bg-success/10 text-success'
              : 'border-muted-foreground bg-muted text-muted-foreground'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              available ? 'bg-success animate-pulse' : 'bg-muted-foreground'
            )} />
            <span className="text-sm font-medium">
              {available ? 'Available for opportunities' : 'Currently busy'}
            </span>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="group flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <Mail className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-semibold text-foreground mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
          </a>

          {/* LinkedIn */}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <Linkedin className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-semibold text-foreground mb-1">LinkedIn</h3>
            <p className="text-sm text-muted-foreground">Connect professionally</p>
          </a>

          {/* GitHub */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <Github className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-semibold text-foreground mb-1">GitHub</h3>
            <p className="text-sm text-muted-foreground">View projects</p>
          </a>
        </div>

        {/* Location & Timezone */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{timezone}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
