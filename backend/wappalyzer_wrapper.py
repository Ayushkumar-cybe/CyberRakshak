import sys
import json
import click
from Wappalyzer import Wappalyzer, WebPage

@click.command()
@click.argument('url')
def main(url):
    try:
        wappalyzer = Wappalyzer.latest()
        webpage = WebPage.new_from_url(url)
        # This returns a dictionary: {'TechName': {'versions': ['1.0'], 'categories': ['CMS']}}
        warnings = wappalyzer.analyze_with_versions_and_categories(webpage)

        output = {"urls": {url: {"technologies": []}}}

        for tech, info in warnings.items():
            # Extract version (take the first one if available)
            version_list = info.get('versions', [])
            version_str = version_list[0] if version_list else ""

            # Format categories as objects for the parser: [{"name": "CMS"}]
            categories = [{"name": cat} for cat in info.get('categories', [])]

            output["urls"][url]["technologies"].append({
                "name": tech,
                "version": version_str,
                "categories": categories, 
                "confidence": 100
            })

        print(json.dumps(output))
    except Exception as e:
        # Print error as JSON so the parser doesn't crash
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
