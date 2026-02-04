import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoData {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    price?: string;
    currency?: string;
    availability?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private readonly defaultTitle = 'VaryaGO: Variedad que llega contigo | Envío a todo Colombia';
    private readonly defaultDescription = 'VaryaGO es tu destino para todo lo relacionado con el hogar. Descubre una amplia gama de muebles, decoración y accesorios para cada rincón de tu casa.';
    private readonly defaultImage = 'https://varyago.com/assets/images/logo.png';
    private readonly siteUrl = 'https://varyago.com';

    constructor(
        private title: Title,
        private meta: Meta,
        @Inject(DOCUMENT) private doc: Document
    ) { }

    updateTags(data: SeoData) {
        // Title
        const pageTitle = data.title ? `${data.title} | VaryaGO` : this.defaultTitle;
        this.title.setTitle(pageTitle);

        // Meta Description
        this.meta.updateTag({
            name: 'description',
            content: data.description || this.defaultDescription
        });

        // Keywords
        if (data.keywords) {
            this.meta.updateTag({ name: 'keywords', content: data.keywords });
        }

        // Open Graph
        this.meta.updateTag({ property: 'og:title', content: pageTitle });
        this.meta.updateTag({
            property: 'og:description',
            content: data.description || this.defaultDescription
        });
        this.meta.updateTag({
            property: 'og:image',
            content: data.image || this.defaultImage
        });
        this.meta.updateTag({
            property: 'og:url',
            content: data.url || this.siteUrl
        });
        this.meta.updateTag({
            property: 'og:type',
            content: data.type || 'website'
        });

        // Twitter Card
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
        this.meta.updateTag({
            name: 'twitter:description',
            content: data.description || this.defaultDescription
        });
        this.meta.updateTag({
            name: 'twitter:image',
            content: data.image || this.defaultImage
        });

        // Product specific tags
        if (data.price) {
            this.meta.updateTag({ property: 'product:price:amount', content: data.price });
            this.meta.updateTag({ property: 'product:price:currency', content: data.currency || 'COP' });
        }

        // Canonical URL
        this.updateCanonicalUrl(data.url || this.siteUrl);
    }

    updateCanonicalUrl(url: string) {
        let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');

        if (!link) {
            link = this.doc.createElement('link');
            link.setAttribute('rel', 'canonical');
            this.doc.head.appendChild(link);
        }

        link.setAttribute('href', url);
    }

    addProductSchema(product: any) {
        // Remove existing schema if any
        const existingScript = this.doc.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            existingScript.remove();
        }

        const script = this.doc.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images?.map((img: any) => img.url) || [],
            description: product.description,
            sku: product.sku,
            brand: {
                '@type': 'Brand',
                name: product.brand || 'VaryaGO'
            },
            offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: 'COP',
                availability: product.stock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                url: `https://varyago.com/product/${product.slug}`
            },
            aggregateRating: product.rating ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount || 1
            } : undefined
        });

        this.doc.head.appendChild(script);
    }

    addBreadcrumbSchema(breadcrumbs: Array<{ name: string, url: string }>) {
        const existingScript = this.doc.querySelector('script[data-schema="breadcrumb"]');
        if (existingScript) {
            existingScript.remove();
        }

        const script = this.doc.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-schema', 'breadcrumb');
        script.text = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url
            }))
        });

        this.doc.head.appendChild(script);
    }
}
