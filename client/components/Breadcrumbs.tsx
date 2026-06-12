import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect } from 'react';

interface BreadcrumbItem {
    label: string;
    path: string;
}

const ROUTE_LABELS: Record<string, string> = {
    'student-dashboard': 'Student Dashboard',
    'teacher-dashboard': 'Teacher Dashboard',
    'student-login': 'Student Login',
    'teacher-login': 'Teacher Login',
    'student-signup': 'Student Signup',
    'teacher-signup': 'Teacher Signup',
    'student-quiz': 'Quizzes',
    'create-quiz': 'Create Quiz',
    'timetable': 'Timetable',
    'announcements': 'Announcements',
    'courses': 'Courses',
    'profile': 'Profile',
    'progress': 'Progress',
    'student-performance': 'Student Performance',
};

export function Breadcrumbs() {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', path: '/' },
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;
        breadcrumbs.push({
            label: ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
            path: currentPath,
        });
    });

    // Add structured data for breadcrumbs
    useEffect(() => {
        const breadcrumbList = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                'position': index + 1,
                'name': crumb.label,
                'item': `${window.location.origin}${crumb.path}`,
            })),
        };

        // Remove existing breadcrumb structured data
        const existingScript = document.querySelector('script[data-breadcrumb]');
        if (existingScript) {
            existingScript.remove();
        }

        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-breadcrumb', 'true');
        script.textContent = JSON.stringify(breadcrumbList);
        document.head.appendChild(script);

        return () => {
            const scriptToRemove = document.querySelector('script[data-breadcrumb]');
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [location.pathname]);

    // Don't show breadcrumbs on home page
    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted-foreground mb-4 overflow-x-auto pb-2"
        >
            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const isFirst = index === 0;

                return (
                    <div key={crumb.path} className="flex items-center gap-2 whitespace-nowrap">
                        {index > 0 && (
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-muted-foreground/50" />
                        )}
                        {isLast ? (
                            <span className="font-medium text-foreground flex items-center gap-1.5">
                                {isFirst && <Home className="w-3 h-3 sm:w-4 sm:h-4" />}
                                <span className="hidden xs:inline">{crumb.label}</span>
                                <span className="xs:hidden">{crumb.label.split(' ')[0]}</span>
                            </span>
                        ) : (
                            <Link
                                to={crumb.path}
                                className="hover:text-foreground transition-colors flex items-center gap-1.5 touch-manipulation"
                            >
                                {isFirst && <Home className="w-3 h-3 sm:w-4 sm:h-4" />}
                                <span className="hidden xs:inline">{crumb.label}</span>
                                <span className="xs:hidden">{isFirst ? '' : crumb.label.split(' ')[0]}</span>
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
