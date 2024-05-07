export function generateSlug(text: string): string {
    
    const withoutAccents = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    
    const slug = withoutAccents
        .toLowerCase() 
        .replace(/[^a-z0-9]/g, "-") 
        .replace(/-+/g, "-") 
        .replace(/^-|-$/g, ""); 
    
    return slug;
}