import {
  Application,
  ParameterType,
  PageEvent,
  Reflection,
  DeclarationReflection,
  UrlMapping,
  ProjectReflection,
  Renderer,
} from "typedoc";
import { MarkdownTheme } from "typedoc-plugin-markdown";
import { MarkdownThemeOptionsReader } from "./options-reader";

class StorybookTheme extends MarkdownTheme {
  storybookPath: string;

  constructor(renderer: Renderer) {
    super(renderer);
    this.storybookPath = this.getOption("storybookPath") as string;
  }

  createUrl(name: string, kindString?: string): string {
    const paths = [this.storybookPath];
    if (kindString) {
      paths.push(kindString);
    }
    paths.push(name);
    return paths.join("/");
  }

  createFullUrl(name: string, kindString?: string): string {
    const url = this.createUrl(name, kindString);
    return `${url}.stories.mdx`;
  }

  override toUrl(mapping: any, reflection: DeclarationReflection) {
    return this.createFullUrl(reflection.getAlias(), mapping.directory);
  }

  extractNameFromUrl(url?: string, suffix: string = "md"): string {
    const regex = new RegExp("([A-Za-z0-9]+)." + suffix);
    const name = url?.match(regex);
    return name ? name[1] : "";
  }

  /**
   * rename root-level files like README to storybook-stories
   */
  override getUrls(project: ProjectReflection): UrlMapping<any>[] {
    const origUrls = super.getUrls(project);

    console.log(project.children);


    origUrls
      .filter((urlMapping) => !urlMapping.model.kindString)
      .forEach((urlMapping) => {
        const name = this.extractNameFromUrl(urlMapping.url);
        console.log(name);
        urlMapping.url = this.createFullUrl(name);
      });

    return origUrls;
  }

  /**
   * 1. normal link replacement
   * TypeDoc/kindString/newLink.stories.mdx
   * => ?path=/story/typedoc-kindstring-newlink--page
   * 2. hashed link replacement
   * TypeDoc/kindString/newLink.stories.mdx#hash
   * => #hash
   */
  storybookLink(link: string): string {
    const newLink = link.replace(/\(|\)/g, "").replace(".stories.mdx", "");
    const [fileName, hash] = newLink.split("#");
    const file = fileName.replace(/\/|_/g, "-").toLowerCase();
    return hash ? `(#${hash})` : `(?path=/story/${file}--page)`;
  }

  storybookLinksReplacement(content: string): string {
    const links =
      content.match(/\(([A-Za-z0-9_\:\/\.\-]+).stories.mdx.*?\)/gm) || [];
    let newContent = content;
    links.forEach((link) => {
      newContent = newContent.replace(link, this.storybookLink(link));
    });

    const modulesLink = this.storybookLink(this.createUrl("modules-index"));
    newContent = newContent.replace("(modules.md)", modulesLink);
    const readmeLink = this.storybookLink(this.createUrl("README"));
    newContent = newContent.replace("(README.md)", readmeLink);
    return newContent;
  }

  override render(page: PageEvent<Reflection>): string {
    let renderedPage: string = super.render(page);
    let path = page.url
      .replace("modules.stories.mdx", "modules-index")
      .replace(".stories.mdx", "");
    renderedPage = `<Meta title='${path}' />\n\n${renderedPage}`;
    renderedPage = this.storybookLinksReplacement(renderedPage);
    return renderedPage;
  }

  /**
   * force absolute paths
   */
  override getRelativeUrl(absolute: string) {
    return absolute;
  }
}

export function load(app: Application) {
  app.renderer.defineTheme("storybook", StorybookTheme);
  app.options.addReader(new MarkdownThemeOptionsReader());

  app.options.addDeclaration({
    help: "[Markdown Plugin] Storybook directory path.",
    name: "storybookPath",
    type: ParameterType.String,
    defaultValue: "TypeDoc",
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Do not render page title.",
    name: "hidePageTitle",
    type: ParameterType.Boolean,
    defaultValue: false,
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Do not render breadcrumbs in template.",
    name: "hideBreadcrumbs",
    type: ParameterType.Boolean,
    defaultValue: false,
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Specifies the base path that all links to be served from. If omitted all urls will be relative.",
    name: "publicPath",
    type: ParameterType.String,
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Use HTML named anchors as fragment identifiers for engines that do not automatically assign header ids. Should be set for Bitbucket Server docs.",
    name: "namedAnchors",
    type: ParameterType.Boolean,
    defaultValue: false,
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Output all reflections into seperate output files.",
    name: "allReflectionsHaveOwnDocument",
    type: ParameterType.Boolean,
    defaultValue: false,
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Separator used to format filenames.",
    name: "filenameSeparator",
    type: ParameterType.String,
    defaultValue: ".",
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] The file name of the entry document.",
    name: "entryDocument",
    type: ParameterType.String,
    defaultValue: "README.md",
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Do not render in-page table of contents items.",
    name: "hideInPageTOC",
    type: ParameterType.Boolean,
    defaultValue: false,
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Customise the index page title.",
    name: "indexTitle",
    type: ParameterType.String,
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Do not add special symbols for class members.",
    name: "hideMembersSymbol",
    type: ParameterType.Boolean,
    defaultValue: false,
  });

  app.options.addDeclaration({
    help: "[Markdown Plugin] Preserve anchor casing when generating links.",
    name: "preserveAnchorCasing",
    type: ParameterType.Boolean,
    defaultValue: false,
  });
}
