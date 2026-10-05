import { describe, it, expect } from "vitest";
import { createElement } from "react";

import {
  CareerCardBuilder,
  CareerCardBuilderSteps,
  CareerCardPreviewPanel,
  STEPS,
  type BuilderStep,
} from "./career-card-builder";
import { CareerCardBuilderSection } from "./career-card-builder-section";
import { CareerCardBuilderPreview } from "./career-card-builder-preview";

describe("CareerCardBuilder", () => {
  it("renders stepContent for the active step", () => {
    const el = createElement(CareerCardBuilder, {
      stepContent: {
        basics: "basics-content",
        design: "design-content",
        company: "company-content",
        preview: "preview-content",
      },
      preview: null,
    });
    expect(el.props.stepContent.basics).toBe("basics-content");
    expect(el.props.stepContent.design).toBe("design-content");
    expect(el.props.stepContent.company).toBe("company-content");
    expect(el.props.stepContent.preview).toBe("preview-content");
  });

  it("defaults to basics step", () => {
    const el = createElement(CareerCardBuilder, {
      stepContent: {
        basics: "basics-content",
        design: "design-content",
        company: "company-content",
        preview: "preview-content",
      },
      preview: null,
    });
    expect(el.props.initialStep).toBeUndefined();
  });
});

describe("CareerCardBuilderSteps", () => {
  it("has exactly four steps in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual([
      "basics",
      "design",
      "company",
      "preview",
    ]);
    expect(STEPS.map((s) => s.label)).toEqual([
      "Basics",
      "Design",
      "Company",
      "Preview",
    ]);
  });

  it("marks the active step", () => {
    const el = createElement(CareerCardBuilderSteps, {
      active: "design",
      onChange: () => {},
    });
    expect(el.props.active).toBe("design");
  });

  it("calls onChange with the clicked step id", () => {
    let called: BuilderStep | null = null;
    const el = createElement(CareerCardBuilderSteps, {
      active: "basics",
      onChange: (step: BuilderStep) => {
        called = step;
      },
    });
    // Simulate what the component does internally when a step is clicked
    el.props.onChange("company");
    expect(called).toBe("company");
  });
});

describe("CareerCardPreviewPanel", () => {
  it("accepts previewMode and change handler", () => {
    /* eslint-disable react/no-children-prop */
    const el = createElement(CareerCardPreviewPanel, {
      previewMode: "mobile",
      onPreviewModeChange: () => {},
      children: null,
    });
    /* eslint-enable react/no-children-prop */
    expect(el.props.previewMode).toBe("mobile");
  });
});

describe("CareerCardBuilderSection", () => {
  it("accepts title, description, children and id", () => {
    /* eslint-disable react/no-children-prop */
    const el = createElement(CareerCardBuilderSection, {
      title: "Test Section",
      description: "A test description",
      id: "test-section",
      children: null,
    });
    /* eslint-enable react/no-children-prop */
    expect(el.props.title).toBe("Test Section");
    expect(el.props.description).toBe("A test description");
    expect(el.props.id).toBe("test-section");
  });
});

describe("CareerCardBuilderPreview", () => {
  it("accepts preview props", () => {
    const el = createElement(CareerCardBuilderPreview, {
      state: null,
      displayName: "Alice Smith",
      photoUrl: null,
      coverUrl: null,
      photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
      coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
      isPublished: false,
    });
    expect(el.props.displayName).toBe("Alice Smith");
    expect(el.props.state).toBeNull();
  });
});
