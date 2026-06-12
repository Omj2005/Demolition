import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    canonical?: string;
}

const DEFAULT_SEO = {
    title: 'Ravya Management System - Modern School & Education Platform',
    description: 'Comprehensive school management platform for students and teachers. Features include interactive timetables, daily schedule planners, quizzes, performance tracking, and real-time announcements.',
    keywords: 'school management, education platform, student dashboard, teacher portal, online quiz, timetable, schedule planner',
    ogImage: '/og-image.png',
};

export function SEO({
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    ogImage = DEFAULT_SEO.ogImage,
    canonical,
}: SEOProps) {
    const location = useLocation();

    useEffect(() => {
        // Update document title
        document.title = title;

        // Update or create meta tags
        updateMetaTag('name', 'description', description);
        updateMetaTag('name', 'keywords', keywords);
        updateMetaTag('property', 'og:title', title);
        updateMetaTag('property', 'og:description', description);
        updateMetaTag('property', 'og:image', ogImage);
        updateMetaTag('name', 'twitter:title', title);
        updateMetaTag('name', 'twitter:description', description);
        updateMetaTag('name', 'twitter:image', ogImage);

        // Update canonical URL
        const canonicalUrl = canonical || `${window.location.origin}${location.pathname}`;
        updateCanonical(canonicalUrl);
        updateMetaTag('property', 'og:url', canonicalUrl);
        updateMetaTag('name', 'twitter:url', canonicalUrl);
    }, [title, description, keywords, ogImage, canonical, location]);

    return null;
}

function updateMetaTag(attribute: string, attributeValue: string, content: string) {
    let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`) as HTMLMetaElement;

    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
    }

    element.setAttribute('content', content);
}

function updateCanonical(url: string) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }

    link.setAttribute('href', url);
}

// Page-specific SEO configurations
export const PAGE_SEO = {
    home: {
        title: 'Ravya Management System - Modern School & Education Platform',
        description: 'Welcome to Ravya - A comprehensive school management platform designed for modern education. Features for both students and teachers.',
        keywords: 'school management system, education platform, ravya, student portal, teacher dashboard',
    },
    studentDashboard: {
        title: 'Student Dashboard - Ravya Management System',
        description: 'Access your courses, timetable, quizzes, and daily schedule planner. Track your performance and stay updated with announcements.',
        keywords: 'student dashboard, my courses, timetable, daily planner, quiz, student performance',
    },
    teacherDashboard: {
        title: 'Teacher Dashboard - Ravya Management System',
        description: 'Manage your classes, create quizzes, track student performance, and make announcements. Complete teacher portal for modern education.',
        keywords: 'teacher dashboard, create quiz, student performance, class management, announcements',
    },
    timetable: {
        title: 'Class Timetable - Ravya Management System',
        description: 'View and manage class timetables. Interactive schedule for all classes and sections with subject allocation.',
        keywords: 'timetable, class schedule, period allocation, school timetable',
    },
    quiz: {
        title: 'Quizzes - Ravya Management System',
        description: 'Take interactive quizzes and test your knowledge. View quiz history and track your performance.',
        keywords: 'online quiz, student quiz, quiz platform, test knowledge, quiz history',
    },
    createQuiz: {
        title: 'Create Quiz - Ravya Management System',
        description: 'Create and publish quizzes for your students. Easy-to-use quiz creation tool for teachers.',
        keywords: 'create quiz, teacher tools, quiz maker, online assessment',
    },
    profile: {
        title: 'My Profile - Ravya Management System',
        description: 'Manage your profile information, view your activity history, and customize your settings.',
        keywords: 'user profile, account settings, profile management',
    },
    announcements: {
        title: 'Announcements - Ravya Management System',
        description: 'Stay updated with the latest school announcements and important notifications.',
        keywords: 'school announcements, notifications, updates, school news',
    },
    studentLogin: {
        title: 'Student Login - Ravya Management System',
        description: 'Sign in to access your student dashboard, courses, quizzes, and schedule planner.',
        keywords: 'student login, student sign in, student portal access',
    },
    teacherLogin: {
        title: 'Teacher Login - Ravya Management System',
        description: 'Sign in to access your teacher dashboard, create quizzes, and manage your classes.',
        keywords: 'teacher login, teacher sign in, teacher portal access',
    },
};
