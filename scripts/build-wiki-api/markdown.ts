import { NodeHtmlMarkdown } from "node-html-markdown";

export const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {},
  /* customTransformers (optional) */ {
    var: { prefix: "`", postfix: "`" },
    kbd: { prefix: "`", postfix: "`" },
    dl({ node }) {
      const arr: { dt: Node[]; dd: Node }[] = [];
      let currentDtNodes: Node[] = [];

      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i] as Node & { rawTagName?: string };

        if (childNode.rawTagName === "dt") {
          // We've found a new <dt> element, so create a new array for its nodes
          currentDtNodes = [childNode];
        } else if (childNode.rawTagName === "dd") {
          // We've found a <dd> element, so add it to the array along with the current <dt> nodes
          arr.push({ dt: currentDtNodes, dd: childNode });
        } else if (childNode.textContent?.trim()) {
          // This is a text node or some other element, so add it to the current <dt> nodes
          currentDtNodes.push(childNode);
        }
      }

      const markdownList: string = arr
        .map(({ dt, dd }) => {
          const dtMarkdown = dt
            .map(d => nhm.translate(d.textContent!))
            .map(name => "`" + name + "`")
            .join(", ");
          const ddMarkdown = nhm.translate(dd.textContent!);
          return `* ${dtMarkdown}: ${ddMarkdown}`;
        })
        .join("\n");

      return {
        content: markdownList,
      };
    },
  },
  /* customCodeBlockTranslators (optional) */ undefined
);
